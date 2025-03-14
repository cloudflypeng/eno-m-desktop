import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";

import "./style.css";

import "./demos/ipc";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app").$nextTick(() => {
	postMessage({ payload: "removeLoading" }, "*");
});
