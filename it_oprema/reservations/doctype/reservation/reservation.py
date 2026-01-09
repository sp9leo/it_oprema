# Copyright (c) 2026, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Reservation(Document):
    def validate(self):
        self.check_overlap()

    def check_overlap(self):
        overlaps = frappe.db.sql("""
            SELECT name FROM `tabReservation`
            WHERE reservation_item = %s
            AND name != %s
            AND status != 'Cancelled'
            AND (
                (from_time <= %s AND to_time >= %s) OR
                (from_time <= %s AND to_time >= %s)
            )
        """, (
            self.reservation_item,
            self.name or "",
            self.from_time, self.from_time,
            self.to_time, self.to_time
        ))

        if overlaps:
            frappe.throw("This item is already booked for the selected time.")
def after_insert(self):
    frappe.db.set_value("Available Slot", self.slot, "is_booked", 1)
def on_cancel(self):
    frappe.db.set_value("Available Slot", self.slot, "is_booked", 0)
