// Helper: format time nicely (HH:MM)
function formatTime(dt) {
    // dt is "YYYY-MM-DD HH:MM:SS"
    if (!dt) return "";
    var parts = dt.split(" ");
    if (parts.length < 2) return dt;
    return parts[1].slice(0, 5);
}

// Global state
var currentWeekStart = null;

frappe.ready(function() {
    var $roomSelect = $("#room-select");
    var $prevWeek = $("#prev-week");
    var $nextWeek = $("#next-week");
    var $body = $("#weekly-body");

    // Initialize week start as today (Monday-based)
    var today = new Date();
    var day = today.getDay(); // 0=Sun,1=Mon...
    var diffToMonday = (day === 0 ? -6 : 1 - day);
    today.setDate(today.getDate() + diffToMonday);
    currentWeekStart = today;

    function formatDate(d) {
        return d.toISOString().slice(0, 10);
    }

    function shiftWeek(offsetDays) {
        currentWeekStart.setDate(currentWeekStart.getDate() + offsetDays);
        loadWeek();
    }

    $prevWeek.on("click", function() {
        shiftWeek(-7);
    });

    $nextWeek.on("click", function() {
        shiftWeek(7);
    });

    $roomSelect.on("change", function() {
        loadWeek();
    });

    function loadWeek() {
        var room = $roomSelect.val();
        if (!room) return;

        frappe.call({
            method: "it_oprema.www.rooms2.get_weekly_slots",
            args: {
                room: room,
                week_start: formatDate(currentWeekStart)
            },
            callback: function(r) {
                if (r.exc || !r.message) {
                    $body.html("<tr><td colspan='8'>No data</td></tr>");
                    return;
                }
                renderTable(r.message);
            }
        });
    }

    function renderTable(slots) {
        // slots: list of {start_time, end_time, is_full}
        // Build a map: day -> list of slots
        var days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        var daySlots = {};
        days.forEach(function(d) { daySlots[d] = []; });

        slots.forEach(function(s) {
            var d = new Date(s.start_time);
            var weekday = d.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue...
            if (!daySlots[weekday]) daySlots[weekday] = [];
            daySlots[weekday].push(s);
        });

        // Collect unique time labels (start times)
        var timeLabels = [];
        slots.forEach(function(s) {
            var label = formatTime(s.start_time) + " - " + formatTime(s.end_time);
            if (timeLabels.indexOf(label) === -1) {
                timeLabels.push(label);
            }
        });
        timeLabels.sort();

        var html = "";

        timeLabels.forEach(function(label) {
            html += "<tr>";
            html += "<td>" + label + "</td>";

            days.forEach(function(dayName) {
                var dayList = daySlots[dayName] || [];
                var slot = dayList.find(function(s) {
                    var l = formatTime(s.start_time) + " - " + formatTime(s.end_time);
                    return l === label;
                });

                if (!slot) {
                    html += "<td></td>";
                    return;
                }

                var cls = slot.is_full ? "full" : "free";
                var room = $("#room-select").val();

                html += "<td>";
                html += "<div class='slot " + cls + "' " +
                        "data-room='" + room + "' " +
                        "data-start='" + slot.start_time + "' " +
                        "data-end='" + slot.end_time + "'>";
                html += formatTime(slot.start_time) + " - " + formatTime(slot.end_time);
                html += "</div>";
                html += "</td>";
            });

            html += "</tr>";
        });

        if (!html) {
            html = "<tr><td colspan='8'>No slots for this week</td></tr>";
        }

        $body.html(html);
    }

    // Click handler for free slots
    $(document).on("click", ".slot.free", function() {
        var room = $(this).data("room");
        var start = $(this).data("start");
        var end = $(this).data("end");

        open_reservation_dialog(room, start, end);
    });

    function open_reservation_dialog(room, start, end) {
        var d = new frappe.ui.Dialog({
            title: "Reserve Slot",
            fields: [
                {
                    label: "Room",
                    fieldname: "reservation_item",
                    fieldtype: "Link",
                    options: "Reservation Item",
                    default: room,
                    read_only: 1
                },
                {
                    label: "From",
                    fieldname: "from_time",
                    fieldtype: "Datetime",
                    default: start
                },
                {
                    label: "To",
                    fieldname: "to_time",
                    fieldtype: "Datetime",
                    default: end
                },
                {
                    label: "Purpose",
                    fieldname: "purpose",
                    fieldtype: "Data",
                    reqd: 1
                }
            ],
            primary_action_label: "Reserve",
            primary_action: function(values) {
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Reservation",
                            reservation_item: values.reservation_item,
                            from_time: values.from_time,
                            to_time: values.to_time,
                            purpose: values.purpose
                        }
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.msgprint("Reservation created");
                            d.hide();
                            loadWeek();
                        }
                    }
                });
            }
        });

        d.show();
    }

    // Initial load
    loadWeek();
});
