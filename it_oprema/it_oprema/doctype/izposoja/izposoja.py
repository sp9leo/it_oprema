# Copyright (c) 2024, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Izposoja(Document):
	pass

@frappe.whitelist()
def get_context():
    frappe.db.get_list("Izposoja") # type: ignore
    
@frappe.whitelist()
def get_events():
    frappe.db.get_list("Izposoja") # type: ignore
    
