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

    # -----------------------------
    # 1. VALIDATION
    # -----------------------------
    if slot_doc.is_full:
        frappe.throw("Ta termin je že polno zaseden.")

    # -----------------------------
    # 2. CREATE RESERVATION
    # -----------------------------
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

    # -----------------------------
    # 3. UPDATE SLOT CAPACITY
    # -----------------------------
    # Single-capacity slot
    if slot_doc.capacity == 1:
        slot_doc.is_booked = 1
        slot_doc.is_full = 1

    # Multi-capacity slot
    else:
        slot_doc.booked_count = (slot_doc.booked_count or 0) + 1

        if slot_doc.booked_count >= slot_doc.capacity:
            slot_doc.is_full = 1

    # Avoid overlap validation
    slot_doc.flags.ignore_validate = True
    slot_doc.save(ignore_permissions=True)

    # -----------------------------
    # 4. REALTIME EVENT
    # -----------------------------
    frappe.publish_realtime(
        event="slot_booked",
        message={
            "slot": slot_doc.name,
            "reservation_item": slot_doc.reservation_item,
            "remaining_capacity": slot_doc.capacity - slot_doc.booked_count
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
