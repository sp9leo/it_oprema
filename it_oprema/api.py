import frappe
from frappe.utils import now_datetime

@frappe.whitelist(allow_guest=True)
def get_reservation(token):
    doc = frappe.get_value("Reservation", {"access_token": token}, "*", as_dict=True)
    if not doc:
        return None

    # Optional: token expiry check
    if doc.get("token_expiry") and now_datetime() > doc["token_expiry"]:
        return None

    return doc


@frappe.whitelist(allow_guest=True)
def update_reservation(token, from_time=None, to_time=None, notes=None):
    doc = frappe.get_doc("Reservation", {"access_token": token})
    if from_time: doc.from_time = from_time
    if to_time: doc.to_time = to_time
    if notes is not None: doc.notes = notes
    doc.save(ignore_permissions=True)
    return "OK"



@frappe.whitelist(allow_guest=True)
def cancel_reservation(token):
    doc = frappe.get_doc("Reservation", {"access_token": token})

    if doc.status == "Cancelled":
        return "Already cancelled"

    doc.status = "Cancelled"
    doc.save(ignore_permissions=True)
    return "OK"
