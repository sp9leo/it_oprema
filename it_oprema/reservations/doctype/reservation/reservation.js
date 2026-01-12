// Copyright (c) 2026, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Reservation", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Reservation", {
    refresh(frm) {
        if (frm.doc.access_token) {
            frm.add_custom_button("Show Test Link", () => {
                const link = `/reservation?token=${frm.doc.access_token}`;
                frappe.msgprint(`Test link:<br><a href="${link}" target="_blank">${link}</a>`);
            });
        }
    }
});
