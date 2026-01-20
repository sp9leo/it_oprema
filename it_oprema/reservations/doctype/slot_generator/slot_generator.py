import frappe
from frappe.model.document import Document
from frappe.utils import get_datetime, add_to_date

class SlotGenerator(Document):
    pass


@frappe.whitelist()
def generate_slots(docname):
    doc = frappe.get_doc("Slot Generator", docname)

    # Convert date + time fields into full datetime objects
    start_dt = get_datetime(f"{doc.date} {doc.start_time}")
    end_dt = get_datetime(f"{doc.date} {doc.end_time}")

    duration_minutes = doc.slot_duration

    for row in doc.bookable_item:
        current = start_dt

        while current < end_dt:
            next_time = add_to_date(current, minutes=duration_minutes)

            # Prevent duplicates
            exists = frappe.db.exists(
                "Available Slot",
                {
                    "reservation_item": row.item,
                    "start_time": current,
                    "end_time": next_time
                }
            )

            if not exists:
                slot = frappe.new_doc("Available Slot")
                slot.reservation_item = row.item
                slot.start_time = current
                slot.end_time = next_time
                slot.capacity = doc.capacity
                slot.booked_count = 0
                slot.is_full = 0
                slot.slot_date = doc.date

                # Skip validation only during generation
                slot.flags.ignore_validate = True
                slot.insert(ignore_permissions=True)


            current = next_time

    frappe.msgprint("Slots generated successfully.")
