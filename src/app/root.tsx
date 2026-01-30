import './global.css';

// @ts-ignore: allow missing @remix-run/react types in non-Remix environments
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useAsyncError,
  useLocation,
  useRouteError,
  useNavigate,
} from 'react-router';

// Augment ImportMeta so TypeScript recognizes Vite's HMR API (import.meta.hot)
declare global {
  interface ImportMeta {
    hot?: {
      on(event: string, cb: (...args: any[]) => void): void;
      off(event: string, cb: (...args: any[]) => void): void;
    };
    // Vite exposes env on import.meta; include SSR and allow additional keys
    env?: {
      SSR?: boolean;
      [key: string]: any;
    };
  }
}
import { useButton } from '@react-aria/button';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FC,
  Component,
} from 'react';

import { toPng } from 'html-to-image';
import fetch from '@/__create/fetch';
// @ts-ignore
import { SessionProvider } from '@auth/create/react';
// lightweight serializeError replacement for environments without the serialize-error package
function serializeError(error: unknown) {
  if (error instanceof Error) {
    const { name, message, stack, ...rest } = error as any;
    return { name, message, stack, ...rest };
  }
  if (error && typeof error === 'object') {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      try {
        return Object.fromEntries(Object.entries(error as object));
      } catch {
        return { message: 'Unserializable error object' };
      }
    }
  }
  return { message: String(error) };
}

// @ts-ignore: suppress missing module/type error when 'sonner' is not installed
import { Toaster } from 'sonner';
// @ts-ignore
import { LoadFonts } from 'virtual:load-fonts.jsx';
import { HotReloadIndicator } from '../__create/HotReload';
import { useSandboxStore } from '../__create/hmr-sandbox-store';
import type { Route } from './+types/root';
import { useDevServerHeartbeat } from '../__create/useDevServerHeartbeat';

export const links = () => [];

// Assign fetch globally only on the client
if (typeof window !== 'undefined') {
  globalThis.window.fetch = fetch;
}

// SSR-safe LoadFonts
const LoadFontsSSR = (!import.meta.env?.SSR && LoadFonts) ? LoadFonts : null;

if (import.meta.hot) {
  import.meta.hot.on('update-font-links', (urls: string[]) => {
    if (typeof document !== 'undefined') {
      // remove old font links
      for (const link of document.querySelectorAll('link[data-auto-font]')) {
        link.remove();
      }
      // add new ones
      for (const url of urls) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.dataset.autoFont = 'true';
        document.head.appendChild(link);
      }
    }
  });
}

/** Shared error display */
function SharedErrorBoundary({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-[#18191B] text-[#F2F2F2] rounded-lg p-4 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#F2F2F2] rounded-full flex items-center justify-center">
              <span className="text-black text-[1.125rem] leading-none">!</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col gap-1">
              <p className="font-light text-[#F2F2F2] text-sm">App Error Detected</p>
              <p className="text-[#959697] text-sm font-light">
                It looks like an error occurred while trying to use your app.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ErrorBoundary for react-router */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SharedErrorBoundary isOpen={true} />;
}

/** InternalErrorBoundary with client-only buttons */
function InternalErrorBoundary({ error: errorArg }: Route.ErrorBoundaryProps) {
  const routeError = useRouteError();
  const asyncError = useAsyncError();
  const error = errorArg ?? asyncError ?? routeError;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isClient = typeof window !== 'undefined';

  const showLogsButtonProps = isClient
    ? useButton(
        {
          onPress: () => {
            window.parent.postMessage({ type: 'sandbox:web:show-logs' }, '*');
          },
        },
        useRef<HTMLButtonElement>(null)
      ).buttonProps
    : {};

  const fixButtonProps = isClient
    ? useButton(
        {
          onPress: () => {
            window.parent.postMessage(
              { type: 'sandbox:web:fix', error: serializeError(error) },
              '*'
            );
            setIsOpen(false);
          },
          isDisabled: !error,
        },
        useRef<HTMLButtonElement>(null)
      ).buttonProps
    : {};

  const copyButtonProps = isClient
    ? useButton(
        {
          onPress: () => {
            navigator.clipboard.writeText(JSON.stringify(serializeError(error)));
          },
        },
        useRef<HTMLButtonElement>(null)
      ).buttonProps
    : {};

  const isInIframe = () => {
    try {
      return isClient ? window.parent !== window : false;
    } catch {
      return true;
    }
  };

  return <SharedErrorBoundary isOpen={isOpen}>
    {isInIframe() ? (
      <div className="flex gap-2">
        {!!error && <button {...fixButtonProps} className="error-btn">Try to fix</button>}
        <button {...showLogsButtonProps} className="error-btn">Show logs</button>
      </div>
    ) : (
      <button {...copyButtonProps} className="error-btn">Copy error</button>
    )}
  </SharedErrorBoundary>;
}

/** Class-based error boundary wrapper */
class ErrorBoundaryWrapper extends Component<{ children: ReactNode }, { hasError: boolean; error: unknown | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) return <InternalErrorBoundary error={this.state.error} params={{}} />;
    return this.props.children;
  }
}

/** Client-only wrapper */
export const ClientOnly: FC<{ loader: () => ReactNode }> = ({ loader }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ErrorBoundaryWrapper>{loader()}</ErrorBoundaryWrapper>;
};

/** HMR connection hook */
export const useHmrConnection = () => {
  const [connected, setConnected] = useState(() => !!import.meta.hot);

  useEffect(() => {
    if (!import.meta.hot) return;

    const onDisconnect = () => setConnected(false);
    const onConnect = () => setConnected(true);
    const onFullReload = () => setConnected(false);

    import.meta.hot.on('vite:ws:disconnect', onDisconnect);
    import.meta.hot.on('vite:ws:connect', onConnect);
    import.meta.hot.on('vite:beforeFullReload', onFullReload);

    return () => {
      import.meta.hot?.off('vite:ws:disconnect', onDisconnect);
      import.meta.hot?.off('vite:ws:connect', onConnect);
      import.meta.hot?.off('vite:beforeFullReload', onFullReload);
    };
  }, []);

  return connected;
};

/** Handshake with parent window */
const useHandshakeParent = () => {
  const isHmrConnected = useHmrConnection();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const healthyResponse = { type: 'sandbox:web:healthcheck:response', healthy: isHmrConnected };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'sandbox:web:healthcheck') {
        window.parent.postMessage(healthyResponse, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage(healthyResponse, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, [isHmrConnected]);
};

/** HMR sandbox store hooks */
const useCodeGen = () => {
  const { startCodeGen, setCodeGenGenerating, completeCodeGen, errorCodeGen, stopCodeGen } =
    useSandboxStore();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      switch (type) {
        case 'sandbox:web:codegen:started': startCodeGen(); break;
        case 'sandbox:web:codegen:generating': setCodeGenGenerating(); break;
        case 'sandbox:web:codegen:complete': completeCodeGen(); break;
        case 'sandbox:web:codegen:error': errorCodeGen(); break;
        case 'sandbox:web:codegen:stopped': stopCodeGen(); break;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [startCodeGen, setCodeGenGenerating, completeCodeGen, errorCodeGen, stopCodeGen]);
};

/** Refresh handler */
const useRefresh = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'sandbox:web:refresh:request') {
        setTimeout(() => window.location.reload(), 1000);
        window.parent.postMessage({ type: 'sandbox:web:refresh:complete' }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
};

/** Screenshot handler */
const waitForScreenshotReady = async () => {
  if (typeof document === 'undefined') return;
  const images = Array.from(document.images);
  await Promise.all([
    'fonts' in document ? document.fonts.ready : Promise.resolve(),
    ...images.map(
      (img) => new Promise((resolve) => {
        img.crossOrigin = 'anonymous';
        if (img.complete) resolve(true);
        else { img.onload = () => resolve(true); img.onerror = () => resolve(true); }
      })
    ),
  ]);
  await new Promise((resolve) => setTimeout(resolve, 250));
};

const useHandleScreenshotRequest = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'sandbox:web:screenshot:request') {
        try {
          await waitForScreenshotReady();
          const width = window.innerWidth;
          const height = Math.floor(width / (16 / 9));
          const dataUrl = await toPng(document.body, { cacheBust: true, skipFonts: false, width, height });
          window.parent.postMessage({ type: 'sandbox:web:screenshot:response', dataUrl }, '*');
        } catch (error) {
          window.parent.postMessage({ type: 'sandbox:web:screenshot:error', error: error instanceof Error ? error.message : String(error) }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
};

/** Layout component */
export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;

  useHandshakeParent();
  useCodeGen();
  useRefresh();
  useHandleScreenshotRequest();
  useDevServerHeartbeat();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'sandbox:navigation') navigate(event.data.pathname);
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'sandbox:web:ready' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      window.parent.postMessage({ type: 'sandbox:web:navigation', pathname }, '*');
    }
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script type="module" src="/src/__create/dev-error-overlay.js"></script>
        <link rel="icon" href="/src/__create/favicon.png" />
        {LoadFontsSSR && <LoadFontsSSR />}
      </head>
      <body>
        <ClientOnly loader={() => children} />
        <HotReloadIndicator />
        <Toaster position="bottom-right" />
        <ScrollRestoration />
        <Scripts />
        <script src="https://kit.fontawesome.com/2c15cc0cc7.js" crossOrigin="anonymous" async />
      </body>
    </html>
  );
}

/** App wrapper */
export default function App() {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
}
