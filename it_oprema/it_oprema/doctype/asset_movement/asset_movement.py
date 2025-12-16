import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class AssetMovement(Document):

    def before_insert(self):
        if not self.movement_date:
            self.movement_date = now_datetime()
        if not self.moved_by:
            self.moved_by = frappe.session.user

    def after_insert(self):
        """
        After inserting a movement:
        - Update Asset.current_location
        - Update Device.location
        - If the moved Device is linked to a Computer, refresh Computer fields
          and propagate location to attached Devices, with timeline comments
        """
        if self.asset and self.to_location:
            # Update Asset record
            asset = frappe.get_doc("Device", self.asset)
            asset.current_location = self.to_location
            asset.save(ignore_permissions=True)

            # Update Device record
            if frappe.db.exists("Device", asset.name):
                frappe.db.set_value("Device", asset.name, "location", self.to_location)

                # Check if this Device is linked to a Computer
                computer_name = frappe.db.get_value("Computer", {"device_link": asset.name}, "name")
                if computer_name:
                    # Refresh Computer so fetch_from fields update
                    computer = frappe.get_doc("Computer", computer_name)
                    computer.save(ignore_permissions=True)

                    # Propagate location to attached Devices
                    updated_devices = propagate_computer_location(computer_name, self.to_location)

                    # Add timeline comments
                    computer.add_comment(
                        "Info",
                        f"Computer {computer_name} moved to {self.to_location}. "
                        f"Updated {len(updated_devices)} attached device(s)."
                    )
                    for dev in updated_devices:
                        frappe.get_doc("Device", dev).add_comment(
                            "Info",
                            f"Location updated to {self.to_location} due to Computer {computer_name} movement."
                        )


def propagate_computer_location(computer_name, new_location):
    """
    Update all Devices attached to a Computer when the Computer's Device moves.
    Returns list of updated device names.
    """
    links = frappe.get_all(
        "Computer Device Link",
        filters={"computer_link": computer_name},
        fields=["device_link"]
    )
    updated = []
    for link in links:
        frappe.db.set_value("Device", link.device_link, "location", new_location)
        updated.append(link.device_link)
    return updated
