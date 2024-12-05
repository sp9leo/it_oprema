frappe.views.calendar["Izposoja"] = {
    field_map: {
        "start": "starts_on",
        "end": "ends_on",
        "title": "title",
        "allDay": "all_day",
        
    },
    gantt: true,

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
    }
};

