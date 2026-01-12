import frappe
from frappe.model.document import Document
import uuid
from frappe.utils import add_to_date, now_datetime

class Reservation(Document):

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # INSERT / SUBMIT / UPDATE / CANCEL
    # ---------------------------------------------------------

    def before_insert(self):
        # Generate access token and expiry
        self.access_token = str(uuid.uuid4())
        self.token_expiry = add_to_date(now_datetime(), days=7)

    def after_insert(self):
        # Do NOT adjust slot here — draft reservations should not count
        pass

    def on_submit(self):
        # Count slot usage only when reservation becomes active
        self.adjust_slot(self.slot, +1)

    def on_update_after_submit(self):
        # Slot changed after submission
        if hasattr(self, "_old_slot") and self._old_slot != self.slot:
            if self._old_slot:
                self.adjust_slot(self._old_slot, -1)
            self.adjust_slot(self.slot, +1)

    def on_cancel(self):
        # Cancel reduces slot usage
        self.adjust_slot(self.slot, -1)

    def on_trash(self):
        # Only adjust if somehow deleted without cancel (rare)
        if self.status != "Cancelled":
            self.adjust_slot(self.slot, -1)

    # ---------------------------------------------------------
    # SLOT ADJUSTMENT
    # ---------------------------------------------------------

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
