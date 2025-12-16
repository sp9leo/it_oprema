# Copyright (c) 2023, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

# class Device(Document):
# 	pass


# class Device(Document):
#     def get_indicator(self):
#         # Check if there is an active/approved booking for this device
#         active_booking = frappe.db.exists(
#             "Asset Booking",
#             {
#                 "booking_asset": self.name,
#                 "booking_status": ["in", ["Approved", "Active"]]
#             }
#         )

#         if active_booking:
#             return {
#                 "label": "Booked",
#                 "color": "red",
#                 "status": "Booked"
#             }
#         else:
#             return {
#                 "label": "Available",
#                 "color": "green",
#                 "status": "Available"
#             }

import frappe
from frappe.model.document import Document

class Device(Document):
    def on_update(self):
        if self.computer_link:
            # Ensure link exists in Computer Device Link
            existing = frappe.get_all(
                "Computer Device Link",
                filters={"computer_link": self.computer_link, "device_link": self.name}
            )
            if not existing:
                frappe.get_doc({
                    "doctype": "Computer Device Link",
                    "computer_link": self.computer_link,
                    "device_link": self.name
                }).insert(ignore_permissions=True)

            # Sync Device location to Computer's location
            comp_location = frappe.db.get_value("Device", self.computer_link, "location")
            if comp_location:
                frappe.db.set_value("Device", self.name, "location", comp_location)

            self.add_comment("Info", f"Attached to Computer {self.computer_link}")
            frappe.get_doc("Computer", self.computer_link).add_comment("Info", f"Device {self.name} attached")

        else:
            # If detached, remove link records
            links = frappe.get_all(
                "Computer Device Link",
                filters={"device_link": self.name},
                fields=["name", "computer_link"]
            )
            for link in links:
                frappe.delete_doc("Computer Device Link", link.name, ignore_permissions=True)
                comp = frappe.get_doc("Computer", link.computer_link)
                comp.add_comment("Info", f"Device {self.name} detached")

            self.add_comment("Info", "Detached from Computer")
import frappe
from frappe.model.document import Document

class Device(Document):
    def on_update(self):
        # Find Computer linked to this Device
        computer_name = frappe.db.get_value("Computer", {"device_link": self.name}, "name")
        if computer_name:
            computer = frappe.get_doc("Computer", computer_name)
            # Trigger a save to refresh fetch_from fields
            computer.save(ignore_permissions=True)
