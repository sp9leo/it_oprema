document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("weekly-body");
    const roomSelect = document.getElementById("room-select");

    let currentWeekStart = getMonday(new Date());

    loadWeek();

    document.getElementById("prev-week").onclick = () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        loadWeek();
    };

    document.getElementById("next-week").onclick = () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        loadWeek();
    };

    roomSelect.onchange = loadWeek;

    function loadWeek() {
        const room = roomSelect.value;
        const weekStartStr = currentWeekStart.toISOString().split("T")[0];

        frappe.call({
            method: "it_oprema.www.rooms.get_weekly_slots",
            args: { room, week_start: weekStartStr },
            callback: (r) => {
                renderTable(r.message || []);
            }
        });
    }

    function renderTable(slots) {
        tableBody.innerHTML = "";

        const grouped = {};

        slots.forEach(slot => {
            const time = slot.start_time.split(" ")[1].slice(0,5);
            if (!grouped[time]) grouped[time] = {};
            const day = new Date(slot.start_time).getDay(); // 1=Mon
            grouped[time][day] = slot;
        });

        Object.keys(grouped).forEach(time => {
            const row = document.createElement("tr");
            row.innerHTML = `<td class="font-bold">${time}</td>`;

            for (let d = 1; d <= 7; d++) {
                const slot = grouped[time][d];
                if (!slot) {
                    row.innerHTML += `<td></td>`;
                    continue;
                }

                const free = !slot.is_full;
                const cls = free ? "bg-green-200 cursor-pointer" : "bg-red-200";

                row.innerHTML += `
                    <td class="${cls}" data-start="${slot.start_time}" data-end="${slot.end_time}">
                        ${free ? "Free" : "Full"}
                    </td>
                `;
            }

            tableBody.appendChild(row);
        });

        document.querySelectorAll("[data-start]").forEach(cell => {
            cell.onclick = () => {
                if (cell.textContent === "Free") {
                    openReservationModal(cell.dataset.start, cell.dataset.end);
                }
            };
        });
    }

    function getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function openReservationModal(start, end) {
        frappe.prompt([
            { fieldname: "name", label: "Your Name", fieldtype: "Data", reqd: 1 },
            { fieldname: "email", label: "Email", fieldtype: "Data", reqd: 1 }
        ],
        (values) => {
            frappe.call({
                method: "it_oprema.www.reservation.create_reservation",
                args: {
                    from_time: start,
                    to_time: end,
                    reservation_item: roomSelect.value,
                    customer_name: values.name,
                    customer_email: values.email
                },
                callback: () => {
                    frappe.msgprint("Reservation created");
                    loadWeek();
                }
            });
        },
        "Reserve Room");
    }
});
