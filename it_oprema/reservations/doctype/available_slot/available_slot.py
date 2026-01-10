# Copyright (c) 2026, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class AvailableSlot(Document):
	
	def validate(self):
		self.check_overlap()

	def check_overlap(self):
		overlaps = frappe.db.sql("""
			SELECT name FROM `tabAvailable Slot`
			WHERE reservation_item=%s
			AND name!=%s
			AND (
				(start_time <= %s AND end_time >= %s)
			)
		""", (self.reservation_item, self.name or "", self.end_time, self.start_time))

		if overlaps:
			frappe.throw("This slot overlaps with an existing one.")
   
@frappe.whitelist(allow_guest=True)
def get_free_slots(item):
    return frappe.get_all(
        "Available Slot",
        filters={"reservation_item": item, "is_booked": 0},
        fields=["name", "start_time", "end_time"]
    )
