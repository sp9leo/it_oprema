# Copyright (c) 2024, osaz and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document

class ComputerDeviceLink(Document):
    def on_trash(self):
        """
        When a Computer Device Link is deleted:
        - Clear the device's computer_link field
        - Add timeline comments to both Computer and Device
        """
        if self.device_link and self.computer_link:
            # Clear device.computer_link
            frappe.db.set_value("Device", self.device_link, "computer_link", None)

            # Add comments
            frappe.get_doc("Device", self.device_link).add_comment(
                "Info",
                f"Detached from Computer {self.computer_link} (link deleted)."
            )
            frappe.get_doc("Computer", self.computer_link).add_comment(
                "Info",
                f"Device {self.device_link} detached (link deleted)."
            )
