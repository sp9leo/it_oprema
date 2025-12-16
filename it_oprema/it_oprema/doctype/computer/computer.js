frappe.ui.form.on('Computer', {
    refresh: function(frm) {
        // Render attached devices from Computer Device Link
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Computer Device Link",
                filters: { computer_link: frm.doc.name },
                fields: ["name", "device_link", "status", "attached_on", "notes"]
            },
            callback: function(r) {
                let devices = r.message || [];
                let html = "";

                html += `
                    <h4>
                        Attached Devices
                        <button class="btn btn-xs btn-primary pull-right attach-btn-dialog">
                            Attach Device
                        </button>
                    </h4>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th>Status</th>
                                <th>Attached On</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                if (devices.length > 0) {
                    devices.forEach(item => {
                        html += `
                            <tr>
                                <td><a href="/app/device/${item.device_link}">${item.device_link || ''}</a></td>
                                <td>${item.status || ''}</td>
                                <td>${item.attached_on ? moment(item.attached_on).format("YYYY-MM-DD HH:mm:ss") : ''}</td> 
                                <td>${item.notes || ''}</td>
                                <td>
                                    <button class="btn btn-xs btn-danger detach-btn" data-device="${item.device_link}">
                                        Detach
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                } else {
                    html += `<tr><td colspan="5">No devices attached.</td></tr>`;
                }

                html += `</tbody></table>`;

                // Render into HTML field
                if (frm.fields_dict.attached_devices_html) {
                    frm.fields_dict.attached_devices_html.$wrapper.html(html);
                } else {
                    frm.dashboard.add_section(html);
                }

                // Bind detach buttons
                frm.$wrapper.find('.detach-btn').on('click', function() {
                    let device = $(this).data('device');
                    frappe.confirm(
                        `Detach ${device} from Computer ${frm.doc.name}?`,
                        () => {
                            frappe.call({
                                method: "it_oprema.it_oprema.api.detach_device",
                                args: {
                                    computer_link: frm.doc.name,
                                    device_link: device
                                },
                                callback: function() {
                                    frappe.msgprint(`Device ${device} detached successfully`);
                                    frm.reload_doc();
                                }
                            });
                        }
                    );
                });

                // Bind attach button (dialog)
                frm.$wrapper.find('.attach-btn-dialog').on('click', function() {
                    frappe.prompt([
                        {
                            fieldname: 'device_link',
                            label: 'Select Device',
                            fieldtype: 'Link',
                            options: 'Device',
                            reqd: 1,
                            get_query: () => {
                                return {
                                    filters: [
                                        // Only show devices not already attached to any computer
                                        // ["Device", "computer_link", "is", "not set"], 
                                        ["Device", "is_computer", "!=", true] // Exclude devices of type Computer
                                    ]
                                };
                            }
                        }
                    ],
                    (values) => {
                        frappe.call({
                            method: "it_oprema.it_oprema.api.attach_device",
                            args: {
                                computer_link: frm.doc.name,
                                device_link: values.device_link
                            },
                            callback: function(r) {
                                if (r.message && r.message.warning) {
                                    frappe.confirm(
                                        r.message.warning,
                                        () => {
                                            // Retry with force=True
                                            frappe.call({
                                                method: "it_oprema.it_oprema.api.attach_device",
                                                args: {
                                                    computer_link: frm.doc.name,
                                                    device_link: values.device_link,
                                                    force: true
                                                },
                                                callback: function() {
                                                    frappe.msgprint(`Device ${values.device_link} re‑attached to Computer ${frm.doc.name}`);
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
                    'Attach Device',
                    'Attach'
                    );
                });
            }
        });
    }
});

frappe.ui.form.on('Computer', {
    refresh: function(frm) {
        if (frm.doc.device_link) {
            // Fetch linked Device info
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Device",
                    name: frm.doc.device_link
                },
                callback: function(r) {
                    if (!r.message) return;
                    let d = r.message;
                    
                    // Build custom HTML
                    let html = `
                        <div class="device-info-box">
                            <h4>Linked Device Information</h4>
                            <table class="table table-bordered">
                                <tr>
                                    <th>Device Name</th>
                                    <td>${d.device_name || ''}</td>
                                </tr>
                                <tr>
                                    <th>Serial Number</th>
                                    <td>${d.device_serial || ''}</td>
                                </tr>
                                 <tr>
                                    <th>Internal Number</th>
                                    <td>${d.device_id || ''}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>${d.status || ''}</td>
                                </tr>
                                <tr>
                                    <th>Location</th>
                                    <td>${d.location || ''}</td>
                                </tr>
                                <tr>
                                    <th>User</th>
                                    <td>${d.user || ''}</td>
                                </tr>
                            </table>
                        </div>
                    `;

                    // Render into HTML field
                    if (frm.fields_dict.device_info_html) {
                        frm.fields_dict.device_info_html.$wrapper.html(html);
                    }
                }
            });
        } else {
            // Clear if no device linked
            if (frm.fields_dict.device_info_html) {
                frm.fields_dict.device_info_html.$wrapper.html("<p>No device linked.</p>");
            }
        }
    }
});

frappe.ui.form.on('Computer', {
    refresh: function(frm) {
        if (frm.doc.device_link) {
            // Fetch Device info
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Device",
                    name: frm.doc.device_link
                },
                callback: function(r) {
                    if (!r.message) return;
                    let d = r.message;

                    // Build Device info HTML
                    let html = `
                        <div class="device-info-box">
                            <h4>Linked Device Information</h4>
                            <table class="table table-bordered">
                                <tr><th>Device Name</th><td>${d.device_name || ''}</td></tr>
                                <tr><th>Serial Number</th><td>${d.device_serial || ''}</td></tr>
                                <tr><th>Internal Number</th><td>${d.device_id || ''}</td></tr>
                                <tr><th>Status</th><td>${d.status || ''}</td></tr>
                                <tr><th>Location</th><td>${d.location || ''}</td></tr>
                                <tr><th>User</th><td>${d.user || ''}</td></tr>
                            </table>
                        </div>
                    `;

                    if (frm.fields_dict.device_info_html) {
                        frm.fields_dict.device_info_html.$wrapper.html(html);
                    }

                    // Fetch IPs attached to this Device
                    frappe.call({
                        method: "frappe.client.get_list",
                        args: {
                            doctype: "Device IP Link",
                            filters: { device_link: frm.doc.device_link },
                            fields: ["ip_address_link", "attached_on", "notes"]
                        },
                        callback: function(res) {
                            let links = res.message || [];
                            if (!links.length) {
                                frm.fields_dict.device_info_html.$wrapper.append("<p>No IPs attached.</p>");
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

                                    let ip_html = `
                                        <h4>Attached IP Addresses</h4>
                                        <table class="table table-bordered">
                                            <thead>
                                                <tr><th>IP Address</th><th>Status</th><th>Attached On</th><th>Notes</th></tr>
                                            </thead>
                                            <tbody>
                                    `;

                                    links.forEach(link => {
                                        let ip_doc = ip_docs[link.ip_address_link] || {};
                                        ip_html += `
                                            <tr>
                                                <td><a href="/app/ip-address/${link.ip_address_link}">${ip_doc.ip_address || link.ip_address_link}</a></td>
                                                <td>${ip_doc.status || ''}</td>
                                                <td>${link.attached_on ? moment(link.attached_on).format("YYYY-MM-DD HH:mm:ss") : ''}</td>
                                                <td>${link.notes || ''}</td>
                                            </tr>
                                        `;
                                    });

                                    ip_html += `</tbody></table>`;
                                    frm.fields_dict.device_ips_html.$wrapper.append(ip_html);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            if (frm.fields_dict.device_info_html) {
                frm.fields_dict.device_info_html.$wrapper.html("<p>No device linked.</p>");
            }
        }
    }
});


