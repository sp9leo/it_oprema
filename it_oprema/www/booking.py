import frappe
from collections import defaultdict

def get_context(context):
    # Load all active persons
    items = frappe.get_all(
        "Reservation Item",
        filters={"is_active": 1, "item_type": "Person"},
        fields=["name", "item_name", "item_type"],
        order_by="item_name asc"
    )

    # Attach slot counts to each item
    for i in items:
        i.slot_count = frappe.db.count(
            "Available Slot",
            {
                "reservation_item": i.name,
                "is_full": 0
            }
        )

    context.items = items

    # Check if user selected an item
    selected_item = frappe.form_dict.get("item")
    context.selected_item = selected_item

    if not selected_item:
        context.slots_by_date = {}
        return

    # Load available slots for selected item
    slots = frappe.get_all(
        "Available Slot",
        filters={"reservation_item": selected_item, "is_full": 0},
        fields=["name", "start_time", "end_time", "capacity", "booked_count"],
        order_by="start_time asc"
    )

    # Group slots by date
    grouped = defaultdict(list)
    for s in slots:
        grouped[s.start_time.date()].append(s)

    context.slots_by_date = dict(grouped)
