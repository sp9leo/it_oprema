frappe.ready(() => {
    const token = frappe.utils.get_query_params().token;

    if (!token) {
        $("#reservation-container").html("Invalid link.");
        return;
    }

    frappe.call({
        method: "it_oprema.api.get_reservation",
        args: { token },
        callback(r) {
            const doc = r.message;

            if (!doc) {
                $("#reservation-container").html("Reservation not found or expired.");
                return;
            }

            $("#reservation-container").html(`
                <h2>Your Reservation</h2>

                <p><strong>Item:</strong> ${doc.reservation_item}</p>
                <p><strong>Customer:</strong> ${doc.customer_name}</p>
                <p><strong>Email:</strong> ${doc.customer_email}</p>
                <p><strong>Slot:</strong> ${doc.slot}</p>
                <p><strong>From:</strong> ${doc.from_time}</p>
                <p><strong>To:</strong> ${doc.to_time}</p>
                <p><strong>Notes:</strong> ${doc.notes || ""}</p>
                <p><strong>Status:</strong> ${doc.status}</p>

                <button id="edit-btn">Edit Reservation</button>
                <button id="cancel-btn" style="margin-left:10px;">Cancel Reservation</button>
            `);

            $("#edit-btn").click(() => {
                window.location.href = `/update-reservation?token=${token}`;
            });

            $("#cancel-btn").click(() => {
                frappe.call({
                    method: "it_oprema.api.cancel_reservation",
                    args: { token },
                    callback() {
                        $("#reservation-container").html("<h3>Reservation cancelled.</h3>");
                    }
                });
            });
        }
    });
});
