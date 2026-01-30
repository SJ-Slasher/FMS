import sql from "@/app/api/utils/sql";

// Get booking reports
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

    // Total bookings summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        SUM(total_amount) as total_revenue
      FROM bookings
      WHERE booking_date BETWEEN ${start} AND ${end}
    `;

    // Bookings by court
    const byCourt = await sql`
      SELECT 
        c.name as court_name,
        COUNT(*) as booking_count,
        SUM(b.total_amount) as revenue
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.booking_date BETWEEN ${start} AND ${end}
      GROUP BY c.id, c.name
      ORDER BY booking_count DESC
    `;

    // Bookings by day
    const byDay = await sql`
      SELECT 
        booking_date,
        COUNT(*) as booking_count,
        SUM(total_amount) as daily_revenue
      FROM bookings
      WHERE booking_date BETWEEN ${start} AND ${end}
      GROUP BY booking_date
      ORDER BY booking_date ASC
    `;

    // Top customers
    const topCustomers = await sql`
      SELECT 
        u.full_name,
        u.email,
        COUNT(*) as booking_count,
        SUM(b.total_amount) as total_spent
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      WHERE b.booking_date BETWEEN ${start} AND ${end}
      GROUP BY u.id, u.full_name, u.email
      ORDER BY booking_count DESC
      LIMIT 10
    `;

    return Response.json({
      summary: summary[0],
      byCourt,
      byDay,
      topCustomers,
      dateRange: { start, end },
    });
  } catch (error) {
    console.error("Error generating booking report:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
