import sql from "@/app/api/utils/sql";

// Get all courts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    let query = "SELECT * FROM courts";
    const params = [];

    if (active !== null) {
      query += " WHERE is_active = $1";
      params.push(active === "true");
    }

    query += " ORDER BY name ASC";

    const courts = await sql(query, params);

    return Response.json({ courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return Response.json({ error: "Failed to fetch courts" }, { status: 500 });
  }
}

// Create a new court
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, court_type, price_per_hour, is_active } = body;

    if (!name || !court_type || !price_per_hour) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO courts (name, description, court_type, price_per_hour, is_active)
      VALUES (${name}, ${description || null}, ${court_type}, ${price_per_hour}, ${is_active !== undefined ? is_active : true})
      RETURNING *
    `;

    return Response.json({ court: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating court:", error);
    return Response.json({ error: "Failed to create court" }, { status: 500 });
  }
}
