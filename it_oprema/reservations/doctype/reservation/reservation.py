import frappe
from frappe.model.document import Document
import uuid
from frappe.utils import add_to_date, now_datetime

class Reservation(Document):

    def validate(self):
        self.check_overlap()

        # Track old slot for slot-change logic
        if self.is_new():
            self._old_slot = None
        else:
            self._old_slot = frappe.db.get_value("Reservation", self.name, "slot")

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

    def before_insert(self):
        self.flags.is_being_inserted = True
        self.access_token = str(uuid.uuid4())
        self.token_expiry = add_to_date(now_datetime(), days=7)

    def after_insert(self):
        # Mark that this insert cycle is still active
        self.flags.is_being_inserted = True
        self.adjust_slot(self.slot, +1)

    def on_update(self):
        # Prevent double-counting on first save
        if getattr(self.flags, "is_being_inserted", False):
            return

        # Slot changed
        if hasattr(self, "_old_slot") and self._old_slot != self.slot:
            if self._old_slot:
                self.adjust_slot(self._old_slot, -1)
            self.adjust_slot(self.slot, +1)

    def on_cancel(self):
        self.adjust_slot(self.slot, -1)

    def on_trash(self):
        if self.status != "Cancelled":
            self.adjust_slot(self.slot, -1)

    def adjust_slot(self, slot_name, delta):
        slot = frappe.db.get_value(
            "Available Slot",
            slot_name,
            ["capacity", "booked_count"],
            as_dict=True
        )

        booked = (slot.booked_count or 0) + delta
        if booked < 0:
            booked = 0

        is_full = 1 if slot.capacity and booked >= slot.capacity else 0

        frappe.db.set_value("Available Slot", slot_name, {
            "booked_count": booked,
            "is_full": is_full
        })
