// Copyright (c) 2023, osaz and contributors
// For license information, please see license.txt

frappe.ui.form.on('Device', {
	// refresh: function(frm) {


    detach: function(frm){


        console.log("button pressed");
		frm.set_value('computer_link', null);
		// frappe.model.set_value(cdt, cdn, 'computer_link', "");
    }
	// }
});
