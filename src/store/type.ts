// @ts-ignore
import type { Howl } from "howler";
// 歌曲
interface Song {
	cover: string;
	author: string;
	musicName: string;
	musicUrl: string;
	duration: number;
}
// 歌手
interface Singer {
	name: string;
	avatar: string;
	detail: object;
}
// 当前播放的歌曲
interface CurrentSong extends Song {
	playTime: number;
	duration: number;
}
// 播放模式
enum LoopMode {
	LIST = "list",
	SINGLE = "single",
	RANDOM = "random",
}
// 项目状态
interface ProjectState {
	howl: Howl | null;
	volume: number;
	currentSong: CurrentSong | null;
	playList: Song[];
	loopMode: LoopMode;
	singerList: Singer[];
}

export type { ProjectState, Song, CurrentSong };
export { LoopMode };
