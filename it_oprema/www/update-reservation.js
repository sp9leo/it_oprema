frappe.ready(() => {
    const token = frappe.utils.get_query_params().token;

    if (!token) {
        $("body").html("Invalid link.");
        return;
    }

    frappe.call({
        method: "it_oprema.api.get_reservation",
        args: { token },
        callback(r) {
            const doc = r.message;

            if (!doc) {
                $("body").html("Reservation not found or expired.");
                return;
            }

            $("#update-container").html(`
                <h2>Edit Reservation</h2>

                <label>From</label>
                <input type="datetime-local" id="from_time" value="${format_datetime(doc.from_time)}">

                <label>To</label>
                <input type="datetime-local" id="to_time" value="${format_datetime(doc.to_time)}">

                <label>Notes</label>
                <textarea id="notes">${doc.notes || ""}</textarea>

                <button id="save-btn">Save Changes</button>
            `);

            $("#save-btn").click(() => {
                frappe.call({
                    method: "it_oprema.api.update_reservation",
                    args: {
                        token,
                        from_time: $("#from_time").val(),
                        to_time: $("#to_time").val(),
                        notes: $("#notes").val()
                    },
                    callback() {
                        $("#update-container").html("<h3>Reservation updated.</h3>");
                    }
                });
            });
        }
    });
});

// Helper: convert Frappe datetime → HTML datetime-local
function format_datetime(dt) {
    if (!dt) return "";
    return dt.replace(" ", "T").slice(0, 16);
}
