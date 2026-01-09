import frappe

def get_context(context):
    context.items = frappe.get_all(
        "Reservation Item",
        filters={"is_active": 1, "item_type":"Person"},
        fields=["name", "item_name", "item_type"]
    )

@frappe.whitelist(allow_guest=True)
def get_free_slots(item):
    return frappe.get_all(
        "Available Slot",
        filters={"reservation_item_link": item, "is_booked": 0},
        fields=["name", "from_datetime", "to_datetime"]
    )
