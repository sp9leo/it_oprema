# Copyright (c) 2026, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Schedule(Document):
	pass

@frappe.whitelist()
def copy_schedule_to_rooms(schedule, rooms):
    rooms = frappe.parse_json(rooms)

    for room in rooms:
        # Check if generator already exists
        gen = frappe.get_all(
            "Slot Generator",
            filters={"schedule": schedule, "applies_to": "Room"},
            limit=1
        )

        if gen:
            gen_doc = frappe.get_doc("Slot Generator", gen[0].name)
        else:
            gen_doc = frappe.new_doc("Slot Generator")
            gen_doc.applies_to = "Room"
            gen_doc.schedule = schedule

        # Clear old reservation_item rows
        gen_doc.reservation_item = []

        # Add selected rooms
        for r in rooms:
            gen_doc.append("reservation_item", {"item": r})

        gen_doc.save()

    frappe.db.commit()
    return {"status": "ok"}
