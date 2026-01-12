import frappe

def get_context(context):
    # If reservation_id is in URL, load reservation for display
    reservation_id = frappe.form_dict.get("reservation_id")
    if reservation_id:
        context.reservation = frappe.get_doc("Reservation", reservation_id)
        context.slot = frappe.get_doc("Available Slot", context.reservation.slot)
        return context

    # Otherwise load slot for the form
    slot = frappe.form_dict.get("slot")
    if not slot:
        frappe.throw("Missing slot parameter")

    context.slot = frappe.get_doc("Available Slot", slot)
    context.item = frappe.get_doc("Reservation Item", context.slot.reservation_item)
    return context



@frappe.whitelist(allow_guest=True)
def create_reservation(slot, customer_name, customer_email, notes=None):

    # Lock slot row to prevent double booking
    slot_doc = frappe.get_doc("Available Slot", slot, for_update=True)

    # Validate
    if slot_doc.is_full:
        frappe.throw("Ta termin je že polno zaseden.")

    if not customer_name or not customer_email:
        frappe.throw("Customer name and email are required.")

    # Create reservation
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
    res.submit()

    # Realtime event
    frappe.publish_realtime(
        event="slot_booked",
        message={
            "slot": slot_doc.name,
            "reservation_item": slot_doc.reservation_item,
        },
        after_commit=True
    )

    return res.name
