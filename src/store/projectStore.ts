import { defineStore } from "pinia";
import type { ProjectState, Song } from "./type";
import { LoopMode } from "./type";

export const useProjectStore = defineStore("project", {
	state: (): ProjectState => ({
		// 播放器相关
		howl: null,
		volume: 0.5,
		currentSong: null,
		playList: [],
		loopMode: LoopMode.LIST,
		// 歌手
		singerList: [],
	}),
	// 计算属性
	getters: {},
	// 操作
	actions: {
		changeLoopMode(mode: LoopMode) {
			this.loopMode = mode;
		},
		changeVolume(volume: number) {
			this.volume = volume;
			this.howl?.volume(volume);
		},
		changeCurrentSong(song: Song) {
			this.currentSong = {
				...song,
				playTime: 0,
			};
		},
		changePlayList(playList: Song[]) {
			this.playList = playList;
		},
		addToPlayList(song: Song) {
			// 如果歌曲已经存在，则不添加
			if (this.playList.some((item) => item.musicUrl === song.musicUrl)) {
				return;
			}
			this.playList.push(song);
		},
		removeFromPlayList(song: Song) {
			this.playList = this.playList.filter(
				(item) => item.musicUrl !== song.musicUrl,
			);
		},
	},
});

export type ProjectStore = ReturnType<typeof useProjectStore>;
