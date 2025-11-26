import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: "/",
			name: "index",
			component: () => import("../views/Home/index.vue"),
		},
		{
			path: "/home",
			name: "home",
			component: () => import("../views/Home/index.vue"),
		},
		{
			path: "/search",
			name: "search",
			component: () => import("../views/Search.vue"),
		},
		{
			path: "/playlist",
			name: "playlist",
			component: () => import("../playlist/index.vue"),
		},
		{
			path: "/singerList",
			name: "singerList",
			component: () => import("../pages/Singer/SingerList.vue"),
		},
		{
			path: "/singerDetail/:mid",
			name: "singerDetail",
			component: () => import("../pages/Singer/SingerDetail.vue"),
		},
		{
			path: "/rank",
			name: "rank",
			component: () => import("../views/Rank/index.vue"),
		},
	],
});

export default router;
