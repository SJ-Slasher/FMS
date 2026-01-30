import sql from "@/app/api/utils/sql";

// Get a single booking
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const booking = await sql`
      SELECT 
        b.*,
        c.name as court_name,
        c.court_type,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN users u ON b.customer_id = u.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.id = ${id}
    `;

    if (booking.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return Response.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// Update a booking
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (body.status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(body.status);
    }
    if (body.notes !== undefined) {
      setClauses.push(`notes = $${paramCount++}`);
      values.push(body.notes);
    }
    if (body.total_amount !== undefined) {
      setClauses.push(`total_amount = $${paramCount++}`);
      values.push(body.total_amount);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE bookings SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ booking: result[0] });
  } catch (error) {
    console.error("Error updating booking:", error);
    return Response.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}

// Delete a booking
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM bookings WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return Response.json(
      { error: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
