import frappe
from collections import defaultdict

def get_context(context):
    # -----------------------------------------
    # 1. Load all active persons
    # -----------------------------------------
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

    # -----------------------------------------
    # 2. Check if user selected an item
    # -----------------------------------------
    selected_item = frappe.form_dict.get("item")
    context.selected_item = selected_item

    if not selected_item:
        context.slots_by_date = {}
        return

    # Load Reservation Item doc (for step 2 header)
    context.item_doc = frappe.get_doc("Reservation Item", selected_item)

    # -----------------------------------------
    # 3. Load available slots for selected item
    # -----------------------------------------
    slots = frappe.get_all(
        "Available Slot",
        filters={"reservation_item": selected_item, "is_full": 0},
        fields=[
            "name",
            "start_time",
            "end_time",
            "capacity",
            "booked_count",
            "reservation_item"
        ],
        order_by="start_time asc"
    )
    for s in slots: 
        item_doc = frappe.get_doc("Reservation Item", s.reservation_item) 
        s.item_name = item_doc.item_name
    context.selected_item = frappe.get_doc("Reservation Item", selected_item)


    # -----------------------------------------
    # 4. Group slots by date (using start_time)
    # -----------------------------------------
    grouped = defaultdict(list)

    for s in slots:
        date_key = s.start_time.date()
        grouped[date_key].append(s)

    context.slots_by_date = dict(grouped)
