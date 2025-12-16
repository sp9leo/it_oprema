// Copyright (c) 2023, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on('Device', {
//     refresh: function(frm) {
//         // Detach button (already working)
//         // frm.add_custom_button('Detach from Computer', () => {
//         //     if (frm.doc.computer_link) {
//         //         frappe.confirm(
//         //             `Detach ${frm.doc.name} from Computer ${frm.doc.computer_link}?`,
//         //             () => {
//         //                 let computer = frm.doc.computer_link;
//         //                 let device = frm.doc.name;

//         //                 frm.set_value('computer_link', null);
//         //                 frm.save();

//         //                 frappe.call({
//         //                     method: "it_oprema.it_oprema.api.detach_device",
//         //                     args: {
//         //                         computer_link: computer,
//         //                         device_link: device
//         //                     },
//         //                     callback: function() {
//         //                         frappe.msgprint(`Device ${device} detached successfully`);
//         //                         frm.reload_doc();
//         //                     }
//         //                 });
//         //             }
//         //         );
//         //     } else {
//         //         frappe.msgprint('This device is not linked to any Computer');
//         //     }
//         // });

//         // Attach button
//         // frm.add_custom_button('Attach to Computer', () => {
//         //     frappe.prompt([
//         //         {
//         //             fieldname: 'computer_link',
//         //             label: 'Select Computer',
//         //             fieldtype: 'Link',
//         //             options: 'Computer',
//         //             reqd: 1
//         //         }
//         //     ],
//         //     (values) => {
//         //         let computer = values.computer_link;
//         //         let device = frm.doc.name;

//         //         // Update Device record
//         //         frm.set_value('computer_link', computer);
//         //         frm.save();

//         //         // Call backend to create the link record
//         //         frappe.call({
//         //             method: "it_oprema.it_oprema.api.attach_device",
//         //             args: {
//         //                 computer_link: computer,
//         //                 device_link: device
//         //             },
//         //             callback: function() {
//         //                 frappe.msgprint(`Device ${device} attached to Computer ${computer}`);
//         //                 frm.reload_doc();
//         //             }
//         //         });
//         //     },
//         //     'Attach Device',
//         //     'Attach');
//         // });
//     }
// });


//asset movements
frappe.ui.form.on('Device', {
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

//asset booking history
frappe.ui.form.on('Device', {
    refresh: function(frm) {
        if (!frm.doc.__islocal) {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Asset Booking",
                    filters: { booking_asset: frm.doc.name },
                    fields: ["name", "booking_asset", "booking_start", "booking_end", "booking_user", "booking_note", "booking_status", "modified", "modified_by"],
                    order_by: "modified desc"
                },
                callback: function(r) {
                    if (r.message) {
                        let html = `
                            <h4>Bookings</h4>
                            <button class="btn btn-primary btn-sm" id="new-booking-btn">
                                + New Booking
                            </button>
                            <table class="table table-bordered table-hover mt-2">
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>By</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        r.message.forEach(m => {
                            // status badge colors
                            let statusColors = {
                                "Requested": "orange",
                                "Approved": "blue",
                                "Active": "green",
                                "Returned": "gray"
                            };
                            let badgeColor = statusColors[m.booking_status] || "red";

                            html += `
                                <tr>
                                    <td>
                                        <a href="/Asset Booking/${m.name}" 
                                           class="booking-link" 
                                           data-name="${m.name}">
                                           ${m.booking_asset}
                                        </a>
                                    </td>
                                    <td>${m.booking_start}</td>
                                    <td>${m.booking_end}</td>
                                    <td>${m.booking_user}</td>
                                    <td><span class="indicator ${badgeColor}">${m.booking_status}</span></td>
                                    <td>${m.booking_note || ''}</td>
									<td><small>${m.modified ? frappe.datetime.str_to_user(m.modified).split(" ")[0] : ''}<br>${m.modified_by || ''}</small></td>
                                </tr>
                            `;
                        });

                        html += "</tbody></table>";
                        frm.fields_dict.bookings_html.$wrapper.html(html);

                        // New booking button
                        frm.fields_dict.bookings_html.$wrapper.find("#new-booking-btn").on("click", function() {
                            frappe.new_doc("Asset Booking", {
                                booking_asset: frm.doc.name
                            });
                        });

                        // Optional: highlight clicked link’s row
                        frm.fields_dict.bookings_html.$wrapper.find(".booking-link").on("click", function(e) {
                            e.preventDefault();
                            let booking_name = $(this).data("name");

                            // remove highlight from other rows
                            frm.fields_dict.bookings_html.$wrapper.find("tr").removeClass("table-active");

                            // highlight the row containing this link
                            $(this).closest("tr").addClass("table-active");

                            // open booking form
                            frappe.set_route("Form", "Asset Booking", booking_name);
                        });
                    }
                }
            });
        }
    }
});

// frappe.ui.form.on('Device', {
//     refresh: function(frm) {
//         frm.add_custom_button('Attach to Computer', () => {
//             frappe.prompt([
//                 {
//                     fieldname: 'computer_link',
//                     label: 'Select Computer',
//                     fieldtype: 'Link',
//                     options: 'Computer',
//                     reqd: 1
//                 }
//             ],
//             (values) => {
//                 let computer = values.computer_link;
//                 let device = frm.doc.name;

//                 frappe.call({
//                     method: "it_oprema.it_oprema.api.attach_device",
//                     args: {
//                         computer_link: computer,
//                         device_link: device
//                     },
//                     callback: function(r) {
//                         if (r.message && r.message.warning) {
//                             frappe.confirm(
//                                 r.message.warning,
//                                 () => {
//                                     // Retry with force=True
//                                     frappe.call({
//                                         method: "it_oprema.it_oprema.api.attach_device",
//                                         args: {
//                                             computer_link: computer,
//                                             device_link: device,
//                                             force: true
//                                         },
//                                         callback: function() {
//                                             frappe.msgprint(`Device ${device} attached to Computer ${computer}`);
//                                             frm.reload_doc();
//                                         }
//                                     });
//                                 }
//                             );
//                         } else if (r.message && r.message.ok) {
//                             frappe.msgprint(r.message.message);
//                             frm.reload_doc();
//                         }
//                     }
//                 });
//             });
//         });
//     }
// });
 //ip address linking

// frappe.ui.form.on('Device', {
//     refresh: function(frm) {
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "Device IP Link",   // junction DocType
//                 filters: { device_link: frm.doc.name },
//                 fields: ["ip_address_link", "attached_on", "notes"]
//             },
//             callback: function(r) {
//                 let ips = r.message || [];
//                 let html = `
//                     <h4>
//                         Attached IP Addresses
//                         <button class="btn btn-xs btn-primary pull-right attach-ip-btn">
//                             Attach IP
//                         </button>
//                     </h4>
//                     <table class="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th>IP Address</th>
//                                 <th>Attached On</th>
//                                 <th>Notes</th>
//                                 <th>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                 `;

//                 if (ips.length > 0) {
//                     ips.forEach(item => {
//                         html += `
//                             <tr>
//                                 <td><a href="/app/ip-address/${item.ip_address_link}">${item.ip_address_link}</a></td>
//                                 <td>${item.attached_on ? moment(item.attached_on).format("YYYY-MM-DD HH:mm:ss") : ''}
//                                 </td>
//                                 <td>${item.notes || ''}</td>
//                                 <td>
//                                     <button class="btn btn-xs btn-danger detach-ip-btn" data-ip="${item.ip_address_link}">
//                                         Detach
//                                     </button>
//                                 </td>
//                             </tr>
//                         `;
//                     });
//                 } else {
//                     html += `<tr><td colspan="4">No IPs attached.</td></tr>`;
//                 }

//                 html += `</tbody></table>`;

//                 frm.fields_dict.attached_ips_html.$wrapper.html(html);

//                 // Detach handler
//                 frm.$wrapper.find('.detach-ip-btn').on('click', function() {
//                     let ip = $(this).data('ip');
//                     frappe.confirm(
//                         `Detach IP ${ip} from Device ${frm.doc.name}?`,
//                         () => {
//                             frappe.call({
//                                 method: "it_oprema.it_oprema.api.detach_ip",
//                                 args: {
//                                     device_link: frm.doc.name,
//                                     ip_address_link: ip
//                                 },
//                                 callback: function() {
//                                     frappe.msgprint(`IP ${ip} detached successfully`);
//                                     frm.reload_doc();
//                                 }
//                             });
//                         }
//                     );
//                 });

//                 // Attach handler (dialog)
//                 frm.$wrapper.find('.attach-ip-btn').on('click', function() {
//                     frappe.prompt([
//                         {
//                             fieldname: 'ip_address_link',
//                             label: 'Select IP Address',
//                             fieldtype: 'Link',
//                             options: 'IP Address',
//                             reqd: 1,
//                             get_query: () => {
//                                 return {
//                                     filters: [
//                                         ["IP Address", "device_link", "is", "not set"]
//                                     ]
//                                 };
//                             }
//                         }
//                     ],
//                     (values) => {
//                         frappe.call({
//                             method: "it_oprema.it_oprema.api.attach_ip",
//                             args: {
//                                 device_link: frm.doc.name,
//                                 ip_address_link: values.ip_address_link
//                             },
//                             callback: function(r) {
//                                 if (r.message && r.message.warning) {
//                                     frappe.confirm(
//                                         r.message.warning,
//                                         () => {
//                                             frappe.call({
//                                                 method: "it_oprema.it_oprema.api.attach_ip",
//                                                 args: {
//                                                     device_link: frm.doc.name,
//                                                     ip_address_link: values.ip_address_link,
//                                                     force: true
//                                                 },
//                                                 callback: function() {
//                                                     frappe.msgprint(`IP ${values.ip_address_link} re‑attached to Device ${frm.doc.name}`);
//                                                     frm.reload_doc();
//                                                 }
//                                             });
//                                         }
//                                     );
//                                 } else if (r.message && r.message.ok) {
//                                     frappe.msgprint(r.message.message);
//                                     frm.reload_doc();
//                                 }
//                             }
//                         });
//                     },
//                     'Attach IP Address',
//                     'Attach'
//                     );
//                 });
//             }
//         });
//     }
// });

frappe.ui.form.on('Device', {
    refresh: function(frm) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Device IP Link",
                filters: { device_link: frm.doc.name },
                fields: ["ip_address_link", "attached_on", "notes"]
            },
            callback: function(r) {
                let links = r.message || [];
                if (!links.length) {
                    frm.fields_dict.attached_ips_html.$wrapper.html("<p>No IPs attached.</p>");
                    return;
                }

                // Collect IP names
                let ip_names = links.map(ip => ip.ip_address_link);

                // Fetch IP Address docs in one go
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "IP Address",
                        filters: { name: ["in", ip_names] },
                        fields: ["name", "ip_address", "status"]
                    },
                    callback: function(res2) {
                        let ip_docs = {};
                        (res2.message || []).forEach(doc => {
                            ip_docs[doc.name] = doc;
                        });

                        // Build HTML table
                        let html = `
                            <h4>
                                Attached IP Addresses
                                <button class="btn btn-xs btn-primary pull-right attach-ip-btn">
                                    Attach IP
                                </button>
                            </h4>
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Status</th>
                                        <th>Attached On</th>
                                        <th>Notes</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        links.forEach(link => {
                            let ip_doc = ip_docs[link.ip_address_link] || {};
                            // status indicator color
                            let status_color = "gray";
                            if (ip_doc.status === "Active") status_color = "green";
                            else if (ip_doc.status === "Reserved") status_color = "orange";
                            else if (ip_doc.status === "Inactive") status_color = "red";

                            html += `
                                <tr>
                                    <td><a href="/app/ip-address/${link.ip_address_link}">${ip_doc.ip_address || link.ip_address_link}</a></td>
                                    <td><span style="color:${status_color}; font-weight:bold;">● ${ip_doc.status || ''}</span></td>
                                    <td>${link.attached_on ? moment(link.attached_on).format("YYYY-MM-DD HH:mm:ss") : ''}</td>
                                    <td>${link.notes || ''}</td>
                                    <td>
                                        <button class="btn btn-xs btn-danger detach-ip-btn" data-ip="${link.ip_address_link}">
                                            Detach
                                        </button>
                                        
                                    </td>
                                </tr>
                            `;
                        });

                        html += `</tbody></table>`;
                        frm.fields_dict.attached_ips_html.$wrapper.html(html);

                        // Detach handler
                        frm.fields_dict.attached_ips_html.$wrapper.find('.detach-ip-btn').on('click', function() {
    let ip = $(this).data('ip');
    frappe.confirm(
        `Detach IP ${ip} from Device ${frm.doc.name}?`,
        () => {
            frappe.call({
                method: "it_oprema.it_oprema.api.detach_ip",
                args: {
                    device_link: frm.doc.name,
                    ip_address_link: ip
                },
                callback: function() {
                    frappe.msgprint(`IP ${ip} detached successfully`);
                    frm.reload_doc();
                }
            });
        }
    );
});

                        // Attach handler remains the same...
                         // Attach handler (dialog)
                frm.$wrapper.find('.attach-ip-btn').on('click', function() {
                    frappe.prompt([
                        {
                            fieldname: 'ip_address_link',
                            label: 'Select IP Address',
                            fieldtype: 'Link',
                            options: 'IP Address',
                            reqd: 1,
                            get_query: () => {
                                return {
                                    filters: [
                                        ["IP Address", "device_link", "is", "not set"]
                                    ]
                                };
                            }
                        }
                    ],
                    (values) => {
                        frappe.call({
                            method: "it_oprema.it_oprema.api.attach_ip",
                            args: {
                                device_link: frm.doc.name,
                                ip_address_link: values.ip_address_link
                            },
                            callback: function(r) {
                                if (r.message && r.message.warning) {
                                    frappe.confirm(
                                        r.message.warning,
                                        () => {
                                            frappe.call({
                                                method: "it_oprema.it_oprema.api.attach_ip",
                                                args: {
                                                    device_link: frm.doc.name,
                                                    ip_address_link: values.ip_address_link,
                                                    force: true
                                                },
                                                callback: function() {
                                                    frappe.msgprint(`IP ${values.ip_address_link} re‑attached to Device ${frm.doc.name}`);
                                                    frm.reload_doc();
                                                }
                                            });
                                        }
                                    );
                                } else if (r.message && r.message.ok) {
                                    frappe.msgprint(r.message.message);
                                    frm.reload_doc();
                                }
                            }
                        });
                    },
                    'Attach IP Address',
                    'Attach'
                    );
                });
                    }
                });
            }
        });
    }
});
