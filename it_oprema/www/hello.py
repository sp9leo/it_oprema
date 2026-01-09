import frappe

def get_context(context):
    context.event_type_colors = {
        "Meeting": "blue",
        "Workshop": "green",
        "Deadline": "red"
    }

    context.grouped_events = {
        "2025-12-17": [
            {
                "id": 1,
                "event": "Projektni sestanek",
                "start": frappe.utils.get_datetime("2025-12-17 09:00:00"),
                "end": frappe.utils.get_datetime("2025-12-17 10:00:00"),
                "description": "Pregled napredka",
                "participants": "Janez, Ana",
                "category": "Sestanek",
                "eventcolor": "blue"
            }
        ]
    }
    return context
