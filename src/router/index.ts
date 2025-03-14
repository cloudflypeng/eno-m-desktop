import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("../views/Home.vue"),
		},
		{
			path: "/home",
			name: "home",
			component: () => import("../views/Home.vue"),
		},
		{
			path: "/search",
			name: "search",
			component: () => import("../views/Search.vue"),
		},
	],
});

export default router;
