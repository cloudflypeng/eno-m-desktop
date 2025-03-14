import { defineStore } from "pinia";

export const useDemoStore = defineStore("demo", {
	state: () => ({
		count: 0,
	}),
});
