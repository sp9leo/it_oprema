# Copyright (c) 2024, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Dogodki(Document):
	pass

def get_context():
    frappe.db.get_list("Dogodki") # type: ignore