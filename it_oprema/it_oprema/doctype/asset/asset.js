// Copyright (c) 2025, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Asset", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Asset', {
    refresh: function(frm) {
        if (!frm.doc.__islocal) {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Asset Movement",
                    filters: { asset: frm.doc.name },
                    fields: ["movement_date", "from_location", "to_location", "moved_by", "notes"],
                    order_by: "movement_date desc"
                },
                callback: function(r) {
                    if (r.message) {
                        let html = "<h4>Movements</h4><table class='table table-bordered'>";
                        html += "<tr><th>Date</th><th>From</th><th>To</th><th>By</th><th>Remarks</th></tr>";
                        r.message.forEach(m => {
                            html += `<tr>
                                <td>${m.movement_date}</td>
                                <td>${m.from_location}</td>
                                <td>${m.to_location}</td>
                                <td>${m.moved_by}</td>
                                <td>${m.notes || ''}</td>
                            </tr>`;
                        });
                        html += "</table>";
                        frm.fields_dict.movements_html.$wrapper.html(html);
                    }
                }
            });
        }
    }
});
