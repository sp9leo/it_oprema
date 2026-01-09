const { createApp } = Vue;

const TestVue = {
  data() {
    return { message: "Hello from TestVue!" };
  },
  template: `<div><h2>{{ message }}</h2></div>`
};

const SecondVue = {
  data() {
    return { counter: 0 };
  },
  template: `<div><button @click="counter++">Clicked {{ counter }} times</button></div>`
};

function setup_test_vue(wrapper) {
  const app = createApp(TestVue);
  app.mount(wrapper.get(0));
}

function setup_second_vue(wrapper) {
  const app = createApp(SecondVue);
  app.mount(wrapper.get(0));
}

frappe.ui.setup_test_vue = setup_test_vue;
frappe.ui.setup_second_vue = setup_second_vue;
