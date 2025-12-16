# Copyright (c) 2023, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Computer(Document):
    def validate(self):
        # Get all current child devices from Computer Device Link records
        current_devices = [
            d.device_link for d in frappe.get_all(
                "Computer Device Link",
                filters={"computer_link": self.name},
                fields=["device_link"]
            ) if d.device_link
        ]

        # Unlink devices that were previously linked but are no longer in the child table
        linked_devices = frappe.get_all("Device", filters={"computer_link": self.name}, pluck="name")
        for dev in linked_devices:
            if dev not in current_devices:
                frappe.db.set_value("Device", dev, "computer_link", None)
                frappe.get_doc("Device", dev).add_comment("Info", f"Detached from Computer {self.name}")
                self.add_comment("Info", f"Detached Device {dev}")

        # Link all current child devices
        for dev in current_devices:
            existing = frappe.db.get_value("Device", dev, "computer_link")
            if existing and existing != self.name:
                frappe.throw(f"Device {dev} is already attached to Computer {existing}")
            frappe.db.set_value("Device", dev, "computer_link", self.name)
            frappe.get_doc("Device", dev).add_comment("Info", f"Attached to Computer {self.name}")
            self.add_comment("Info", f"Attached Device {dev}")

    def on_trash(self):
        # Unlink all devices when Computer is deleted
        devices = frappe.get_all(
            "Computer Device Link",
            filters={"computer_link": self.name},
            fields=["device_link"]
        )
        for d in devices:
            if d.device_link:
                frappe.db.set_value("Device", d.device_link, "computer_link", None)
                frappe.get_doc("Device", d.device_link).add_comment(
                    "Info", f"Detached because Computer {self.name} was deleted"
                )

    def on_update(self):
        # Whenever Computer location changes, update all attached Devices
        if self.location:
            devices = frappe.get_all(
                "Computer Device Link",
                filters={"computer_link": self.name},
                fields=["device_link"]
            )
            for d in devices:
                frappe.db.set_value("Device", d.device_link, "location", self.location)
