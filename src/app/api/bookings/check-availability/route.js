import sql from "@/app/api/utils/sql";

// Check availability for a specific court and date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");

    if (!courtId || !date) {
      return Response.json(
        { error: "Missing courtId or date" },
        { status: 400 },
      );
    }

    // Get all time slots
    const allSlots = await sql`
      SELECT * FROM time_slots 
      WHERE is_active = true 
      ORDER BY start_time ASC
    `;

    // Get booked slots for this court and date
    const bookedSlots = await sql`
      SELECT time_slot_id 
      FROM bookings 
      WHERE court_id = ${courtId} 
      AND booking_date = ${date}
      AND status != 'cancelled'
    `;

    const bookedSlotIds = new Set(bookedSlots.map((b) => b.time_slot_id));

    // Mark slots as available or booked
    const availability = allSlots.map((slot) => ({
      ...slot,
      is_available: !bookedSlotIds.has(slot.id),
    }));

    return Response.json({ availability });
  } catch (error) {
    console.error("Error checking availability:", error);
    return Response.json(
      { error: "Failed to check availability" },
      { status: 500 },
    );
  }
}
