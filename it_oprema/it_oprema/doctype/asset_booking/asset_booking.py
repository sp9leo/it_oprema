# Copyright (c) 2025, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today, getdate

class AssetBooking(Document):
    def validate(self):
        # Convert to date objects for safe comparison
        start_date = getdate(self.booking_start) if self.booking_start else None
        end_date = getdate(self.booking_end) if self.booking_end else None
        today_date = getdate(today())

        # Rule 1: booking_end must not be before booking_start
        if start_date and end_date and end_date < start_date:
            frappe.throw("Booking End cannot be before Booking Start.")

        # Rule 2: booking_start must not be before today
        if start_date and start_date < today_date:
            frappe.throw("Booking Start cannot be before today.")

        # Rule 3: booking_end must not be before today
        if end_date and end_date < today_date:
            frappe.throw("Booking End cannot be before today.")

        # Only check conflicts if this booking is moving into Approved or Active
        if self.booking_status in ("Approved", "Active"):
            overlapping = frappe.db.sql("""
                SELECT name FROM `tabAsset Booking`
                WHERE booking_asset=%s
                AND booking_status IN ('Approved','Active')
                AND name != %s
                AND (
                    (booking_start <= %s AND booking_end >= %s)
                    OR
                    (booking_start <= %s AND booking_end >= %s)
                    OR
                    (booking_start >= %s AND booking_end <= %s)
                )
            """, (
                self.booking_asset,
                self.name,
                self.booking_start, self.booking_start,
                self.booking_end, self.booking_end,
                self.booking_start, self.booking_end
            ))

            if overlapping:
                frappe.throw(f"Asset {self.booking_asset} is already booked during this period.")
