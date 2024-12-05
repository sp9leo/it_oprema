frappe.views.calendar["Dogodki"] = {
    field_map: {
        "start": "start",
        "end": "end",
        "title": "title",
        "allDay": "allDay",
        
    },
    gantt: false,
    options: {
        header: {
            left: 'prev, title, next',
            center: 'today',
            right: ' listOneMonth, listOneWeek, listOneDay, agendaOneDay, agendaOneWeek, agendaOneMonth'
        },
        views: {
            listOneDay: {
                type: 'list',
                titleFormat: 'ddd, DD MMMM YYYY',
                duration: { days: 1 },
                buttonText: 'Day list',
                noEventsMessage: "No appointments for this date"
            },
            listOneWeek: {
                type: 'list',
                duration: { days: 7 },
                buttonText: 'Week list',
                noEventsMessage: "No appointments for this week"
            },
            listOneMonth: {
              type: 'list',
              duration: { days: 31 },
              buttonText: 'Month list',
              noEventsMessage: "No appointments for this week"
          },
            agendaOneDay: {
                type: 'agendaDay',
                titleFormat: 'ddd, DD MMMM YYYY',
                duration: { days: 1 },
                buttonText: 'Day',
                slotDuration: "01:00",
                slotLabelInterval: "01:00",
                minTime: "07:00:00",
                maxTime: "22:00:00"
            },
            agendaOneWeek: {
                type: 'agendaDay',
                duration: { days: 7 },
                buttonText: 'Week',
                slotDuration: "01:00:00",
                minTime: "07:00:00",
                maxTime: "22:00:00"
            },
            agendaOneMonth: {
              type: 'agendaDay',
              duration: { days: 31 },
              buttonText: 'Week',
              slotDuration: "01:00:00",
              minTime: "07:00:00",
              maxTime: "22:00:00"
          }
        },
        defaultView: 'agendaOneDay',
        allDaySlot: false,
        slotEventOverlap: false,
        editable: true,
    resources: function(callback) {
            return frappe.call({
                method: "osaz_app.osaz_app.doctype.dogodki.dogodki.get_context",
                type: "GET",
                callback: function(r) {
                    var resources = r.message || [];
                    callback(resources);
                }
            })
        },
    },
    color_map: {
        "paid_scheduled": "green",
        "paid_open": "purple",
        "paid_complete": "blue",
        "unpaid_scheduled": "red",
        "unpaid_open": "pink",
        "unpaid_complete": "yellow",
        "background": "#b9fff5"
    },
    get_events_method: "frappe.desk.calendar.get_events",
    get_css_class: function(data) {
        if (data.rendering == "background") {
            return "background";
        }
        if (data.payment_status == "Paid" && data.appointment_status == "Scheduled") {
            return "paid_scheduled";
        } else if (data.payment_status == "Paid" && data.appointment_status == "Open") {
            return "paid_open";
        } else if (data.payment_status == "Paid" && data.appointment_status == "Complete") {
            return "paid_complete";
        } else if (data.payment_status == "Not Paid" && data.appointment_status == "Scheduled") {
            return "unpaid_scheduled";
        } else if (data.payment_status == "Not Paid" && data.appointment_status == "Open") {
            return "unpaid_open";
        } else if (data.payment_status == "Not Paid" && data.appointment_status == "Complete") {
            return "unpaid_complete";
        }
    }
  };