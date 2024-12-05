// Copyright (c) 2023, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("IT-Device Manufacturer", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("IT-Device Manufacturer", "onload", function(frm) {
    console.log("query  here");
    frm.set_query("link_wwvr", function() {
        return {
            "filters": {
                "name": ["in", ["Computer", "Device"]]


            }
                
        };
    });
});
