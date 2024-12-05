// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Premik sredstev', {
	setup: (frm) => {
		frm.set_query("to_employee", "assets", (doc) => {
			return {
				filters: {
					company: doc.company
				}
			};
		})
		frm.set_query("from_employee", "assets", (doc) => {
			return {
				filters: {
					company: doc.company
				}
			};
		})
		frm.set_query("reference_name", (doc) => {
			return {
				filters: {
					company: doc.company,
					docstatus: 1
				}
			};
		})
		frm.set_query("reference_doctype", () => {
			return {
				filters: {
					name: ["in", ["Purchase Receipt", "Purchase Invoice"]]
				}
			};
		}),
		frm.set_query("asset", "assets", () => {
			return {
				filters: {
					status: ["not in", ["Draft"]]
				}
			}
		})
	},

	onload: (frm) => {
		frm.trigger('set_required_fields');
	},

	purpose: (frm) => {
		frm.trigger('set_required_fields');
	},

	set_required_fields: (frm, cdt, cdn) => {
		let fieldnames_to_be_altered;
		if (frm.doc.purpose === 'Transfer') {
			fieldnames_to_be_altered = {
				target_location: { read_only: 0, reqd: 1 },
				source_location: { read_only: 1, reqd: 1 },
				from_employee: { read_only: 1, reqd: 0 },
				to_employee: { read_only: 1, reqd: 0 }
			};
		}
		else if (frm.doc.purpose === 'Receipt') {
			fieldnames_to_be_altered = {
				target_location: { read_only: 0, reqd: 1 },
				source_location: { read_only: 1, reqd: 0 },
				from_employee: { read_only: 0, reqd: 1 },
				to_employee: { read_only: 1, reqd: 0 }
			};
		}
		else if (frm.doc.purpose === 'Issue') {
			fieldnames_to_be_altered = {
				target_location: { read_only: 1, reqd: 0 },
				source_location: { read_only: 1, reqd: 0 },
				from_employee: { read_only: 1, reqd: 0 },
				to_employee: { read_only: 0, reqd: 1 }
			};
		}
		if (fieldnames_to_be_altered) {
			Object.keys(fieldnames_to_be_altered).forEach(fieldname => {
				let property_to_be_altered = fieldnames_to_be_altered[fieldname];
				Object.keys(property_to_be_altered).forEach(property => {
					let value = property_to_be_altered[property];
					frm.fields_dict['assets'].grid.update_docfield_property(fieldname, property, value);
				});
			});
			frm.refresh_field('assets');
		}
	}
});

frappe.ui.form.on('Premik sredstev Item', {
	asset: function(frm, cdt, cdn) {
		// on manual entry of an asset auto sets their source location / employee
		const asset = locals[cdt][cdn].asset;
		if (asset){
			frappe.db.get_doc('Device', asset).then((asset_doc) => {
				if(asset_doc.device_location) frappe.model.set_value(cdt, cdn, 'source_location', asset_doc.device_location);
				if(asset_doc.device_user) frappe.model.set_value(cdt, cdn, 'from_employee', asset_doc.device_user);
			}).catch((err) => {
				console.log(err); // eslint-disable-line
			});
		}
	}
});
