import sql from "@/app/api/utils/sql";

// Get all bookings with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = `
      SELECT 
        b.*,
        c.name as court_name,
        u.full_name as customer_name,
        u.email as customer_email,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN users u ON b.customer_id = u.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (courtId) {
      query += ` AND b.court_id = $${paramCount++}`;
      params.push(courtId);
    }

    if (customerId) {
      query += ` AND b.customer_id = $${paramCount++}`;
      params.push(customerId);
    }

    if (status) {
      query += ` AND b.status = $${paramCount++}`;
      params.push(status);
    }

    if (date) {
      query += ` AND b.booking_date = $${paramCount++}`;
      params.push(date);
    }

    if (startDate && endDate) {
      query += ` AND b.booking_date BETWEEN $${paramCount++} AND $${paramCount++}`;
      params.push(startDate, endDate);
    }

    query += " ORDER BY b.booking_date DESC, ts.start_time DESC";

    const bookings = await sql(query, params);

    return Response.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

// Create a new booking
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      court_id,
      customer_id,
      booking_date,
      time_slot_id,
      total_amount,
      status,
      notes,
    } = body;

    if (
      !court_id ||
      !customer_id ||
      !booking_date ||
      !time_slot_id ||
      !total_amount
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check for double booking
    const existing = await sql`
      SELECT id FROM bookings 
      WHERE court_id = ${court_id} 
      AND booking_date = ${booking_date} 
      AND time_slot_id = ${time_slot_id}
      AND status != 'cancelled'
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: "This time slot is already booked" },
        { status: 409 },
      );
    }

    const result = await sql`
      INSERT INTO bookings (court_id, customer_id, booking_date, time_slot_id, total_amount, status, notes)
      VALUES (${court_id}, ${customer_id}, ${booking_date}, ${time_slot_id}, ${total_amount}, ${status || "pending"}, ${notes || null})
      RETURNING *
    `;

    return Response.json({ booking: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error.message && error.message.includes("unique constraint")) {
      return Response.json(
        { error: "This time slot is already booked" },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
