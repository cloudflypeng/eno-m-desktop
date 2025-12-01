import { defineConfig } from "unocss/vite";
import {
	presetAttributify,
	presetIcons,
	presetUno,
	transformerDirectives,
} from "unocss";

export default defineConfig({
	presets: [presetUno(), presetAttributify(), presetIcons()],
	transformers: [transformerDirectives()],
	shortcuts: {
		// 按钮系统
		btn: "bg-$eno-fill-2 hover:bg-$eno-fill-2 px-6 py-1 h-10 rounded-10 cursor-pointer",
		"btn-primary": "px-6 py-2 rounded-full bg-[#1db954] text-black font-bold transition-all duration-300 hover:bg-[#1ed760] hover:scale-105 active:scale-95 shadow-lg",
		"btn-secondary": "px-4 py-2 rounded-lg bg-[#282828] text-white font-medium transition-all duration-300 hover:bg-[#333333] hover:scale-105 active:scale-95",
		"btn-ghost": "px-4 py-2 rounded-lg text-[#b3b3b3] font-medium transition-all duration-300 hover:text-white hover:bg-[#1a1a1a] hover:scale-105 active:scale-95",

		// 悬停项目
		"hov-item": "hover:bg-$eno-fill-1 cursor-pointer p-2 pr-4 rounded-4 transition-all duration-300",
		"has-border": "border border-$eno-border",

		// 卡片系统
		"card-base": "relative rounded-xl bg-gradient-to-b from-[#282828] to-[#1a1a1a] transition-all duration-300 shadow-lg",
		"card-hover": "hover:bg-gradient-to-b hover:from-[#333333] hover:to-[#1f1f1f] hover:shadow-2xl",
		"card-interactive": "cursor-pointer",

		// 文本系统
		"text-display": "text-4xl font-bold text-white",
		"text-heading-1": "text-2xl font-bold text-white",
		"text-heading-2": "text-xl font-bold text-white",
		"text-heading-3": "text-lg font-bold text-white",
		"text-body": "text-base font-normal text-[#b3b3b3]",
		"text-body-small": "text-sm font-normal text-[#a7a7a7]",
		"text-body-tiny": "text-xs font-normal text-[#808080]",

		// 页面容器
		"page-container": "w-full h-full overflow-auto bg-[#121212]",
		"page-inner": "w-full h-full overflow-auto pb-30 px-6 pt-6 bg-[#121212]",

		// 工具类
		"flex-center": "flex items-center justify-center",
		"absolute-cover": "absolute inset-0",
		"group-hover-scale": "group-hover:scale-110 transition-transform duration-300",
		"truncate-2": "line-clamp-2",
		"pointer-none": "pointer-events-none",
	},
});
