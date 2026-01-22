import frappe
from frappe.utils import getdate, add_days, add_to_date


def get_context(context):
    # Load all room-type reservation items
    context.rooms = frappe.get_all(
        "Reservation Item",
        filters={"is_active": 1, "item_type": "Room"},
        fields=["name", "item_name"],
        order_by="item_name asc"
    )


def extract_hm(t):
    total_seconds = t.seconds
    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    return h, m



@frappe.whitelist(allow_guest=True)
def get_weekly_slots(room, week_start):
    week_start = getdate(week_start)
    week_end = add_days(week_start, 7)

    # Load all Slot Generators that apply to rooms
    generators = frappe.get_all(
        "Slot Generator",
        filters={"applies_to": "Room"},
        fields=["name", "start_time", "end_time", "slot_duration", "schedule"]
    )

    # Load full docs so we can inspect child tables
    generator_docs = {
        g.name: frappe.get_doc("Slot Generator", g.name)
        for g in generators
    }

    # Filter generators that include this room in reservation_item table
    generators = [
        g for g in generators
        if room in [d.item for d in generator_docs[g.name].bookable_item]
    ]

    if not generators:
        return []

    # Fetch existing reservations for the week
    reservations = frappe.get_all(
        "Reservation",
        filters={
            "reservation_item": room,
            "from_time": ["between", [week_start, week_end]],
            "status": ["!=", "Cancelled"]
        },
        fields=["from_time", "to_time"]
    )

    def is_reserved(start, end):
        for r in reservations:
            if not (end <= r.from_time or start >= r.to_time):
                return True
        return False

    slots = []

    # Helper to convert Frappe Time (timedelta) into hours/minutes
    def extract_hm(t):
        total_seconds = t.seconds
        h = total_seconds // 3600
        m = (total_seconds % 3600) // 60
        return h, m

    # Generate slots from Slot Generator rules
    for gen in generators:
        gen_doc = generator_docs[gen.name]

        # Extract allowed weekdays
        allowed_days = [d.day for d in gen_doc.days_of_week]  # "Mon", "Tue", ...

        # ---------------------------------------------------------
        # MODE A: Schedule-based (school periods)
        # ---------------------------------------------------------
        if gen_doc.schedule:
            schedule = frappe.get_doc("Schedule", gen_doc.schedule)
            periods = schedule.schedule_periods

            for i in range(7):
                day = add_days(week_start, i)
                weekday = day.strftime("%a")

                if allowed_days and weekday not in allowed_days:
                    continue

                for p in periods:
                    start_h, start_m = extract_hm(p.start_time)
                    end_h, end_m = extract_hm(p.end_time)

                    current = add_to_date(day, hours=start_h, minutes=start_m)
                    end_of_day = add_to_date(day, hours=end_h, minutes=end_m)

                    slots.append({
                        "start_time": current,
                        "end_time": end_of_day,
                        "is_full": 1 if is_reserved(current, end_of_day) else 0
                    })

            # Skip normal slot_duration logic
            continue

        # ---------------------------------------------------------
        # MODE B: Normal slot_duration-based logic
        # ---------------------------------------------------------
        slot_len = gen.slot_duration or 60

        start_h, start_m = extract_hm(gen_doc.start_time)
        end_h, end_m = extract_hm(gen_doc.end_time)

        for i in range(7):
            day = add_days(week_start, i)
            weekday = day.strftime("%a")

            if allowed_days and weekday not in allowed_days:
                continue

            current = add_to_date(day, hours=start_h, minutes=start_m)
            end_of_day = add_to_date(day, hours=end_h, minutes=end_m)

            while current < end_of_day:
                next_slot = add_to_date(current, minutes=slot_len)

                slots.append({
                    "start_time": current,
                    "end_time": next_slot,
                    "is_full": 1 if is_reserved(current, next_slot) else 0
                })

                current = next_slot

    return slots
