import frappe
from frappe.utils import now_datetime

@frappe.whitelist()
def attach_device(computer_link, device_link, force=False):
    """
    Attach a Device to a Computer.
    If the Device is already attached to another Computer, require confirmation.
    """
    # Check if device is already attached
    existing = frappe.get_all(
        "Computer Device Link",
        filters={"device_link": device_link},
        fields=["computer_link"]
    )

    if existing:
        current_computer = existing[0].computer_link
        if current_computer != computer_link and not force:
            return {
                "ok": False,
                "warning": f"Device {device_link} is already attached to Computer {current_computer}. "
                           f"Do you want to detach it and attach to {computer_link}?"
            }

        # If force=True, detach from old computer
        if current_computer != computer_link:
            frappe.db.delete("Computer Device Link", {
                "computer_link": current_computer,
                "device_link": device_link
            })
            frappe.db.set_value("Device", device_link, "computer_link", None)
            frappe.get_doc("Computer", current_computer).add_comment(
                "Info", f"Device {device_link} detached (re‑attached to {computer_link})."
            )

    # Create new link
    doc = frappe.get_doc({
        "doctype": "Computer Device Link",
        "computer_link": computer_link,
        "device_link": device_link,
        "attached_on": now_datetime()
    })
    doc.insert(ignore_permissions=True)

    # Update Device record
    frappe.db.set_value("Device", device_link, "computer_link", computer_link)

    # Sync Device location to Computer's location
    comp_location = frappe.db.get_value("Device", computer_link, "location")
    if comp_location:
        frappe.db.set_value("Device", device_link, "location", comp_location)

    return {"ok": True, "message": f"Device {device_link} attached to Computer {computer_link}"}

#API for IP address linking

@frappe.whitelist()
def attach_ip(device_link, ip_address_link, force=False):
    # Check if IP is already attached
    existing = frappe.get_all(
        "Device IP Link",
        filters={"ip_address_link": ip_address_link},
        fields=["device_link"]
    )
    if existing and existing[0].device_link != device_link and not force:
        return {
            "ok": False,
            "warning": f"IP {ip_address_link} is already attached to Device {existing[0].device_link}. "
                       f"Do you want to detach it and attach to {device_link}?"
        }

    # If force=True, detach from old device
    if existing and existing[0].device_link != device_link:
        frappe.db.delete("Device IP Link", {
            "device_link": existing[0].device_link,
            "ip_address_link": ip_address_link
        })
        frappe.get_doc("Device", existing[0].device_link).add_comment(
            "Info", f"IP {ip_address_link} detached (re‑attached to {device_link})."
        )

    # Create new link
    doc = frappe.get_doc({
        "doctype": "Device IP Link",
        "device_link": device_link,
        "ip_address_link": ip_address_link,
        "attached_on": now_datetime()
    })
    doc.insert(ignore_permissions=True)

    # Timeline comments
    frappe.get_doc("Device", device_link).add_comment(
        "Info", f"IP {ip_address_link} attached."
    )
    frappe.get_doc("IP Address", ip_address_link).add_comment(
        "Info", f"Attached to Device {device_link}."
    )

    return {"ok": True, "message": f"IP {ip_address_link} attached to Device {device_link}"}


@frappe.whitelist()
def detach_ip(device_link, ip_address_link):
    frappe.db.delete("Device IP Link", {
        "device_link": device_link,
        "ip_address_link": ip_address_link
    })
    frappe.get_doc("Device", device_link).add_comment(
        "Info", f"IP {ip_address_link} detached."
    )
    frappe.get_doc("IP Address", ip_address_link).add_comment(
        "Info", f"Detached from Device {device_link}."
    )
    return {"ok": True, "message": f"IP {ip_address_link} detached from Device {device_link}"}
