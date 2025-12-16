// Copyright (c) 2025, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Asset Movement", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Asset Movement', {
    asset: function(frm) {
        if (frm.doc.asset) {
            // Fetch current location from Asset
            frappe.db.get_value('Device', frm.doc.asset, 'location', function(value) {
                if (value && value.location) {
                    frm.set_value('from_location', value.location);
                }
            });
        }
    },

    onload: function(frm) {
        // Auto-fill movement_date with current datetime
        if (!frm.doc.movement_date) {
            frm.set_value('movement_date', frappe.datetime.now_datetime());
        }

        // Auto-fill moved_by with current user
        if (!frm.doc.moved_by) {
            frm.set_value('moved_by', frappe.session.user);
        }
    }
});
