import frappe

def get_context(context):
    slot = frappe.form_dict.slot
    if not slot:
        frappe.throw("Missing slot parameter")

    slot_doc = frappe.get_doc("Available Slot", slot)

    context.slot = slot_doc
    context.item = frappe.get_doc("Reservation Item", slot_doc.reservation_item)


@frappe.whitelist(allow_guest=True)
def create_reservation(slot, customer_name, customer_email, notes=None):
    slot_doc = frappe.get_doc("Available Slot", slot)

    # 1. VALIDATION
    if slot_doc.is_full:
        frappe.throw("Ta termin je že polno zaseden.")

    # 2. CREATE RESERVATION (Desk logic will update slot)
    res = frappe.get_doc({
        "doctype": "Reservation",
        "slot": slot,
        "reservation_item": slot_doc.reservation_item,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "notes": notes,
        "status": "Confirmed"
    })

    res.insert(ignore_permissions=True)

    # 3. REALTIME EVENT
    frappe.publish_realtime(
        event="slot_booked",
        message={
            "slot": slot_doc.name,
            "reservation_item": slot_doc.reservation_item,
        },
        after_commit=True
    )

    return res.name
