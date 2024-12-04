app_name = "it_oprema"
app_title = "It Oprema"
app_publisher = "osaz"
app_description = "it oprema app osaz"
app_email = "osaz@osaz.si"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "it_oprema",
# 		"logo": "/assets/it_oprema/logo.png",
# 		"title": "It Oprema",
# 		"route": "/it_oprema",
# 		"has_permission": "it_oprema.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/it_oprema/css/it_oprema.css"
# app_include_js = "/assets/it_oprema/js/it_oprema.js"

# include js, css files in header of web template
# web_include_css = "/assets/it_oprema/css/it_oprema.css"
# web_include_js = "/assets/it_oprema/js/it_oprema.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "it_oprema/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "it_oprema/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "it_oprema.utils.jinja_methods",
# 	"filters": "it_oprema.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "it_oprema.install.before_install"
# after_install = "it_oprema.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "it_oprema.uninstall.before_uninstall"
# after_uninstall = "it_oprema.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "it_oprema.utils.before_app_install"
# after_app_install = "it_oprema.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "it_oprema.utils.before_app_uninstall"
# after_app_uninstall = "it_oprema.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "it_oprema.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"it_oprema.tasks.all"
# 	],
# 	"daily": [
# 		"it_oprema.tasks.daily"
# 	],
# 	"hourly": [
# 		"it_oprema.tasks.hourly"
# 	],
# 	"weekly": [
# 		"it_oprema.tasks.weekly"
# 	],
# 	"monthly": [
# 		"it_oprema.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "it_oprema.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "it_oprema.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "it_oprema.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["it_oprema.utils.before_request"]
# after_request = ["it_oprema.utils.after_request"]

# Job Events
# ----------
# before_job = ["it_oprema.utils.before_job"]
# after_job = ["it_oprema.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"it_oprema.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

