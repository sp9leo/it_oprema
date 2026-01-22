// // // Copyright (c) 2026, osaz and contributors
// // // For license information, please see license.txt

frappe.ui.form.on("Schedule", {
    refresh: function(frm) {
        if (!frm.doc.__islocal) {
            frm.add_custom_button("Copy to Rooms", function() {
                frappe.prompt(
                    [
                        {
                            fieldname: "rooms",
                            label: "Select Rooms",
                            fieldtype: "MultiSelectList",
                            options: "Reservation Item",
                            get_data: function(txt) {
                                return frappe.db.get_link_options(
                                    "Reservation Item",
                                    txt,
                                    { item_type: "Room" }
                                );
                            }
                        }
                    ],
                    function(values) {
                        frappe.call({
                            method: "your_app.your_module.doctype.schedule.schedule.copy_schedule_to_rooms",
                            args: {
                                schedule: frm.doc.name,
                                rooms: values.rooms
                            },
                            callback: function() {
                                frappe.msgprint("Schedule copied successfully");
                                frm.reload_doc();
                            }
                        });
                    },
                    "Copy Schedule to Rooms"
                );
            });
        }
    }
});
