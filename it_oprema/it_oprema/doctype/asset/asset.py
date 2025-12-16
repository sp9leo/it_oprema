# Copyright (c) 2025, osaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Asset(Document):
	pass

def get_timeline_data(doctype, name):
    if doctype == "Asset":
        return frappe.db.sql("""
            SELECT movement_date, from_location, to_location
            FROM `tabAsset Movement`
            WHERE asset=%s
            ORDER BY movement_date DESC
        """, name, as_dict=True)
