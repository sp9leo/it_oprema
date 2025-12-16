frappe.pages['test-vue'] = {
  on_page_load(wrapper) {
    const page = frappe.ui.make_app_page({
      parent: wrapper,
      title: 'Vue Demo',
      single_column: true,
    });

    const mount_vue = () => {
      const app = Vue.createApp(MyComponent);
      app.mount(page.body);
    };

    if (frappe.boot.developer_mode) {
      frappe.hot_update = frappe.hot_update || [];
      frappe.hot_update.push(mount_vue);
    }

    mount_vue();
  }
};
