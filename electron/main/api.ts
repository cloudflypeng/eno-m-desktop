import { ipcMain } from "electron";
import api from "./api";
import { BLBL } from "./msg.define";
import fetch from "node-fetch";

// 处理API请求的通用函数
async function handleApiRequest(
	event: Electron.IpcMainEvent,
	apiKey: string,
	params: any = {},
) {
	try {
		const apiConfig = api[apiKey];
		if (!apiConfig) {
			throw new Error(`未找到API配置: ${apiKey}`);
		}

		const { url, _fetch, params: defaultParams, afterHandle } = apiConfig;

		// 合并默认参数和传入的参数
		const finalParams = { ...defaultParams, ...params };

		// 构建URL和查询字符串
		const queryString = new URLSearchParams(finalParams).toString();
		const finalUrl = `${url}${queryString ? "?" + queryString : ""}`;

		// 发送请求
		const response = await fetch(finalUrl, {
			..._fetch,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		});

		let data = await response.json();

		// 处理后续处理函数
		if (afterHandle && afterHandle.length > 0) {
			for (const handler of afterHandle) {
				data = handler(data);
			}
		}

		event.reply(`${apiKey}-reply`, { success: true, data });
	} catch (error) {
		event.reply(`${apiKey}-reply`, { success: false, error: error.message });
	}
}

// 注册所有API的IPC监听器
export function setupApiHandlers() {
	Object.keys(api).forEach((apiKey) => {
		ipcMain.on(apiKey, (event, params) => {
			handleApiRequest(event, apiKey, params);
		});
	});
}
