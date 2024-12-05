// Copyright (c) 2023, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Computer device item", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on('Computer device item', {
	device: function(frm, cdt, cdn) {
	    console.log("function here");
		// on manual entry of an asset auto sets their source location / employee
		const device = locals[cdt][cdn].device;
		if (device){
		    console.log("function here");
			frappe.db.get_doc('Device', device).then((asset_doc) => {
				if(asset_doc.attached_to) frappe.model.set_value(cdt, cdn, 'attached_to', asset_doc.name);
				if(asset_doc.device_user) frappe.model.set_value(cdt, cdn, 'from_employee', asset_doc.device_user);
			}).catch((err) => {
				console.log(err); // eslint-disable-line
			});
		}
	}
});