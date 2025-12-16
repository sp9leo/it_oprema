# Copyright (c) 2025, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

# class DeviceIPLink(Document):
# 	pass

class DeviceIPLink(Document):
    def validate(self):
        # Check if this IP is already attached to another computer
        existing = frappe.get_all(
            "Device IP Link",
            filters={"ip_address_link": self.ip_address_link},
            fields=["name", "device_link"]
        )
        for row in existing:
            if row.name != self.name and row.device_link != self.device_link:
                frappe.throw(
                    f"IP {self.ip_address_link} is already attached to Computer {row.device_link}. "
                    "An IP address can only be attached to one computer."
                )
