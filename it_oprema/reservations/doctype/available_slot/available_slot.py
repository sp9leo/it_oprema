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
			WHERE reservation_item_link=%s
			AND name!=%s
			AND (
				(from_datetime <= %s AND to_datetime >= %s)
			)
		""", (self.reservation_item_link, self.name or "", self.to_datetime, self.from_datetime))

		if overlaps:
			frappe.throw("This slot overlaps with an existing one.")
   
@frappe.whitelist(allow_guest=True)
def get_free_slots(item):
    return frappe.get_all(
        "Available Slot",
        filters={"reservation_item_link": item, "is_booked": 0},
        fields=["name", "from_datetime", "to_datetime"]
    )
