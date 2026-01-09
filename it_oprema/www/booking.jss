
function loadSlots() {
    const item = document.getElementById("item-select").value;
    const container = document.getElementById("slots-container");
    const list = document.getElementById("slots-list");
    const loading = document.getElementById("loading");

    if (!item) {
        container.style.display = "none";
        return;
    }

    list.innerHTML = "";
    container.style.display = "none";
    loading.style.display = "block";

    frappe.call({
        method: "it_oprema.reservations.doctype.available_slot.available_slot.get_free_slots",
        args: { item },
        callback(r) {
            loading.style.display = "none";
            container.style.display = "block";

            const slots = r.message;

            if (!slots.length) {
                list.innerHTML = `
                    <div class="alert alert-warning">
                        Trenutno ni prostih terminov.
                    </div>`;
                return;
            }

            slots.forEach(s => {
                const from = frappe.datetime.str_to_user(s.from_datetime);
                const to = frappe.datetime.str_to_user(s.to_datetime);

                const card = `
                    <div class="card shadow-sm mb-3 border-0">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div class="font-weight-bold text-dark">${from} – ${to}</div>
                            </div>
                            <a href="/reservation_form?slot=${s.name}" class="btn btn-primary">
                                Rezerviraj
                            </a>
                        </div>
                    </div>
                `;
                list.innerHTML += card;
            });
        }
    });
}

document.getElementById("item-select").addEventListener("change", loadSlots);

