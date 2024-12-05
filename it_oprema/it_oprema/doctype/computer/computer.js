// Copyright (c) 2023, osaz and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Computer", {
// 	refresh(frm) {

// 	},
// });

// frappe.ui.form.on('Computer device item', {
//     // whenever "state" field is changed
//     device(frm) {
//         frm.set_query("device", (doc) => {
//             return {
//                 filters: {
//                     "attached_to": doc.name // whatever state is selected
//                 }
//             }
//         });
//         console.log(frm);
//     }

//    });


frappe.ui.form.on('Computer device item', {

    device: function (frm, cdt, cdn) {
        if (frm.is_new()) {
            frappe.throw('Please save form before attaching a device')
        }

        console.log("function here");
        // on manual entry of an asset auto sets their source location / employee
        const parent = locals[cdt][cdn].parent;
        const device = locals[cdt][cdn].device;
        console.log(parent);
        frappe.model.set_value(cdt, cdn, 'attached_to', parent);
        if (parent) {
            console.log("function here");
            frappe.db.get_doc('Device', device).then((device_doc) => {
                console.log(device_doc);
                // if(device_doc.attached_to)
                //frappe.model.set_value(cdt, cdn, 'attached_to', device_doc.computer_link);
                frappe.db.set_value('Device', device, 'computer_link', parent)
                    .then(r => {
                        let doc = r.message;
                        console.log(doc);
                    })
                // if(asset_doc.device_user) frappe.model.set_value(cdt, cdn, 'from_employee', asset_doc.device_user);
            }).catch((err) => {
                console.log(err); // eslint-disable-line
            });
        }
    },

    device_remove: function (frm, cdt, cdn) {
        // You code here
        frappe.db.set_value('Device', device, 'computer_link', null)
        // If you console.log(frm.doc.color) you will get the remaining color list
    },






});


frappe.ui.form.on("Computer", "onload", function (frm) {

    console.log("query  here");
    frm.set_query("device", "devices_table", function () {
        return {
            "filters": {
                "computer_link": "",
                "is_computer": 0
            }
        };
    });

    frm.set_query("device_link", function () {
        return {
            "filters": {
                "is_computer": 1,
                "computer_link": ""
            }
        };
    });
});


// //!!!!!!!---Naredi v .py namesto v .js//!!!!!

// frappe.ui.form.on("Computer", {

//     validate(frm) {


//         console.log("function here");
//         // on manual entry of an asset auto sets their source location / employee
//         const parent = frm.doc.name;
//         const device = frm.doc.device_link;
//         const computer_link = frm.doc.name

//         console.log(parent);
//         frappe.model.set_value('attached_to', parent);
//         if (device) {
//             const device = frm.doc.device_link;
//             console.log("function here");
//             frappe.db.get_doc('Device', device).then((device_doc) => {
//                 console.log(device_doc);
                
//                 // if(device_doc.attached_to)
//                 //frappe.model.set_value(cdt, cdn, 'attached_to', device_doc.computer_link);
//                 frappe.db.set_value('Device', device, 'computer_link', parent)
//                     .then(r => {
//                         let doc = r.message;
//                         console.log(doc);
//                     })
//                 // if(asset_doc.device_user) frappe.model.set_value(cdt, cdn, 'from_employee', asset_doc.device_user);
//             }).catch((err) => {
//                 console.log(err); // eslint-disable-line
//             });
//                 }
//         // else {
//         //     console.log("else here");
//         //     frappe.db.set_value('Device', device, 'computer_link', null)
//         //         .then(r => {
//         //             let doc = r.message;
//         //             console.log(doc);
//         //         });






//         // }





//         // # TODO - popravi da se beleži samo en zapis v tabelo devices (child table na computer doctype)
//         let row = frm.add_child('devices_table', {
//             device: device,
//             attached_to: parent

//         });

//         frm.refresh_field('devices_table');
//     },
// });