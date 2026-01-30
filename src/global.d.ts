// Allow importing .js/.jsx/.mjs modules without type declarations
declare module '*.js';
declare module '*.jsx';
declare module '*.mjs';

// Vite HMR and env types for import.meta
interface ImportMetaEnv {
  readonly MODE: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    on(event: string, cb: (...args: any[]) => void): void;
    off(event: string, cb: (...args: any[]) => void): void;
  };
}
import 'react-router';
module 'virtual:load-fonts.jsx' {
	export function LoadFonts(): null;
}
declare module 'react-router' {
	interface AppLoadContext {
		// add context properties here
	}
}
declare module 'npm:stripe' {
	import Stripe from 'stripe';
	export default Stripe;
}
declare module '@auth/create/react' {
	import { SessionProvider } from '@auth/react';
	export { SessionProvider };
}
// src/types/sonner.d.ts
declare module 'sonner' {
  import type { ComponentType, ReactNode } from 'react';

  type Position =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

  type ToasterProps = {
    position?: Position;
    richColors?: boolean;
    duration?: number;
    children?: ReactNode;
  };

  export const Toaster: ComponentType<ToasterProps>;
  export function toast(message: string, options?: { duration?: number; type?: string }): void;
}
