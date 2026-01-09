import frappe

@frappe.whitelist(allow_guest=True)
def trigger():
    frappe.publish_realtime(
        "test_event",
        {"msg": "Hello from server"},
        after_commit=True
    )
