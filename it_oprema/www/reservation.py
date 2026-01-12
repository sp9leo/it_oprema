import frappe
from frappe.utils import now_datetime

def get_context(context):
    token = frappe.form_dict.get("token")

    if not token:
        context.invalid = True
        context.message = "Missing reservation access token"
        return context

    reservation = frappe.db.get_value(
    "Reservation",
    {
        "access_token": token,
        "docstatus": 1   # Only submitted reservations
    },
    ["name", "customer_name", "customer_email", "slot", "status"],
    as_dict=True
)


    if not reservation:
        context.invalid = True
        context.message = "Reservation not found or link expired"
        return context

    slot = frappe.db.get_value(
        "Available Slot",
        reservation.slot,
        ["from_datetime", "to_datetime"],
        as_dict=True
    )

    context.invalid = False
    context.reservation = reservation
    context.slot = slot
    context.access_token = token
    return context


@frappe.whitelist(allow_guest=True)
def cancel_reservation(token, reason=None):
    # Fetch reservation by access token
    reservation = frappe.get_doc("Reservation", {"access_token": token})

    # Already cancelled
    if reservation.docstatus == 2:
        return {"ok": False, "message": "Reservation already cancelled"}

    # If draft, submit it first (submittable doctypes require this)
    if reservation.docstatus == 0:
        reservation.flags.ignore_permissions = True
        reservation.submit()

    # Cancel the reservation
    reservation.flags.ignore_permissions = True
    reservation.cancel()

    # Save reason AFTER cancellation (cannot modify submitted doc before cancel)
    if reason:
        frappe.db.set_value("Reservation", reservation.name, "cancellation_reason", reason)

    # Add timeline comment
    reservation.add_comment(
        "Info",
        f"Reservation cancelled by customer. Reason: {reason or 'No reason provided'}"
    )

    return {"ok": True, "message": "Reservation cancelled successfully"}

