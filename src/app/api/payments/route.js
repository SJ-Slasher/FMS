import sql from "@/app/api/utils/sql";

// Get all payments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");

    let query = `
      SELECT 
        p.*,
        b.booking_date,
        c.name as court_name,
        u.full_name as customer_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN courts c ON b.court_id = c.id
      JOIN users u ON b.customer_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (bookingId) {
      query += ` AND p.booking_id = $${paramCount++}`;
      params.push(bookingId);
    }

    if (status) {
      query += ` AND p.payment_status = $${paramCount++}`;
      params.push(status);
    }

    query += " ORDER BY p.created_at DESC";

    const payments = await sql(query, params);

    return Response.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return Response.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

// Create a new payment
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      booking_id,
      amount,
      payment_method,
      payment_status,
      transaction_id,
    } = body;

    if (!booking_id || !amount || !payment_method) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const paid_at =
      payment_status === "completed" ? new Date().toISOString() : null;

    const result = await sql`
      INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, paid_at)
      VALUES (${booking_id}, ${amount}, ${payment_method}, ${payment_status || "pending"}, ${transaction_id || null}, ${paid_at})
      RETURNING *
    `;

    // If payment is completed, update booking status
    if (payment_status === "completed") {
      await sql`
        UPDATE bookings 
        SET status = 'confirmed' 
        WHERE id = ${booking_id}
      `;
    }

    return Response.json({ payment: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return Response.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}
