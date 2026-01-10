// Copyright (c) 2026, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Slot Generator", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Slot Generator", {
    refresh(frm) {
        frm.add_custom_button("Generate Slots", () => {
            frappe.call({
                method: "it_oprema.reservations.doctype.slot_generator.slot_generator.generate_slots",
                args: { docname: frm.doc.name },
                callback: () => frm.reload_doc()
            });
        });
    }
});
