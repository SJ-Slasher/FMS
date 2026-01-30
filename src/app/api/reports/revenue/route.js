import sql from "@/app/api/utils/sql";

// Get revenue reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to last 30 days if not provided
    const end = endDate || new Date().toISOString().split("T")[0];
    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Revenue summary
    const summary = await sql`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_payments,
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as completed_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_revenue,
        SUM(CASE WHEN payment_status = 'refunded' THEN amount ELSE 0 END) as refunded_amount,
        AVG(amount) as average_payment
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.booking_date BETWEEN ${start} AND ${end}
    `;

    // Revenue by payment method
    const byPaymentMethod = await sql`
      SELECT 
        payment_method,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.booking_date BETWEEN ${start} AND ${end}
      AND payment_status = 'completed'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;

    // Daily revenue
    const dailyRevenue = await sql`
      SELECT 
        b.booking_date,
        SUM(p.amount) as revenue,
        COUNT(*) as payment_count
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.booking_date BETWEEN ${start} AND ${end}
      AND p.payment_status = 'completed'
      GROUP BY b.booking_date
      ORDER BY b.booking_date ASC
    `;

    // Revenue by court type
    const byCourtType = await sql`
      SELECT 
        c.court_type,
        COUNT(*) as booking_count,
        SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN courts c ON b.court_id = c.id
      WHERE b.booking_date BETWEEN ${start} AND ${end}
      AND p.payment_status = 'completed'
      GROUP BY c.court_type
      ORDER BY revenue DESC
    `;

    return Response.json({
      summary: summary[0],
      byPaymentMethod,
      dailyRevenue,
      byCourtType,
      dateRange: { start, end },
    });
  } catch (error) {
    console.error("Error generating revenue report:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
