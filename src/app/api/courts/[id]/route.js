import sql from "@/app/api/utils/sql";

// Get a single court
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const court = await sql`SELECT * FROM courts WHERE id = ${id}`;

    if (court.length === 0) {
      return Response.json({ error: "Court not found" }, { status: 404 });
    }

    return Response.json({ court: court[0] });
  } catch (error) {
    console.error("Error fetching court:", error);
    return Response.json({ error: "Failed to fetch court" }, { status: 500 });
  }
}

// Update a court
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (body.name !== undefined) {
      setClauses.push(`name = $${paramCount++}`);
      values.push(body.name);
    }
    if (body.description !== undefined) {
      setClauses.push(`description = $${paramCount++}`);
      values.push(body.description);
    }
    if (body.court_type !== undefined) {
      setClauses.push(`court_type = $${paramCount++}`);
      values.push(body.court_type);
    }
    if (body.price_per_hour !== undefined) {
      setClauses.push(`price_per_hour = $${paramCount++}`);
      values.push(body.price_per_hour);
    }
    if (body.is_active !== undefined) {
      setClauses.push(`is_active = $${paramCount++}`);
      values.push(body.is_active);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE courts SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Court not found" }, { status: 404 });
    }

    return Response.json({ court: result[0] });
  } catch (error) {
    console.error("Error updating court:", error);
    return Response.json({ error: "Failed to update court" }, { status: 500 });
  }
}

// Delete a court
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM courts WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ error: "Court not found" }, { status: 404 });
    }

    return Response.json({ message: "Court deleted successfully" });
  } catch (error) {
    console.error("Error deleting court:", error);
    return Response.json({ error: "Failed to delete court" }, { status: 500 });
  }
}
