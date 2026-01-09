import frappe

def get_context(context):
    slot = frappe.form_dict.slot
    if not slot:
        frappe.throw("Missing slot parameter")

    slot_doc = frappe.get_doc("Available Slot", slot)

    context.slot = slot_doc
    context.item = frappe.get_doc("Reservation Item", slot_doc.reservation_item_link)
    
@frappe.whitelist(allow_guest=True)
def create_reservation(slot, customer_name, customer_email, notes=None):
    slot_doc = frappe.get_doc("Available Slot", slot)

    if slot_doc.is_booked:
        frappe.throw("Ta termin je že rezerviran.")

    res = frappe.get_doc({
        "doctype": "Reservation",
        "slot": slot,
        "reservation_item": slot_doc.reservation_item_link,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "notes": notes,
        "status": "Confirmed"
    })
    res.insert(ignore_permissions=True)

    slot_doc.is_booked = 1
    slot_doc.save(ignore_permissions=True)

    # 🔴 Realtime event
    frappe.publish_realtime(
        event="slot_booked",
        message={
            "slot": slot_doc.name,
            "reservation_item": slot_doc.reservation_item_link
        },
        after_commit=True
    )

    return res.name



@frappe.whitelist(allow_guest=True)
def announce_open(slot):
    frappe.publish_realtime(
        "slot_opened",
        {"slot": slot},
        after_commit=True
    )

@frappe.whitelist(allow_guest=True)
def announce_close(slot):
    frappe.publish_realtime(
        "slot_closed",
        {"slot": slot},
        after_commit=True
    )

# @frappe.whitelist(allow_guest=True)
# def create_reservation(slot, customer_name, customer_email, notes=None):
#     slot_doc = frappe.get_doc("Available Slot", slot)

#     if slot_doc.is_booked:
#         frappe.throw("Ta termin je že rezerviran.")

#     res = frappe.get_doc({
#         "doctype": "Reservation",
#         "slot": slot,
#         "reservation_item": slot_doc.reservation_item_link,
#         "customer_name": customer_name,
#         "customer_email": customer_email,
#         "notes": notes,
#         "status": "Confirmed"
#     })

#     res.insert(ignore_permissions=True)

#     slot_doc.is_booked = 1
#     slot_doc.save(ignore_permissions=True)

#     return res.name
