import sql from "@/app/api/utils/sql";

// Get all time slots
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    let query = "SELECT * FROM time_slots";
    const params = [];

    if (active !== null) {
      query += " WHERE is_active = $1";
      params.push(active === "true");
    }

    query += " ORDER BY start_time ASC";

    const timeSlots = await sql(query, params);

    return Response.json({ timeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return Response.json(
      { error: "Failed to fetch time slots" },
      { status: 500 },
    );
  }
}
