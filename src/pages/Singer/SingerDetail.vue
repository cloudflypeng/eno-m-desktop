<script setup>
import { useInfiniteScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import SongItem from '~/components/SongItem.vue'
import { getUserArc } from '~/api'

import { useBlblStore } from '~/blbl/store.ts'
import { usePlaylistStore } from '~/playlist/store'
import Loading from '~/components/loading/index.vue'

const PLstore = usePlaylistStore()
const store = useBlblStore()

const info = computed(() => {
  return PLstore.singerCardCache[PLstore.currentSinger]
})

const songListByPage = ref({})
const renderList = computed(() => {
  return Object.values(songListByPage.value).flat()
})

const loading = ref(false)
const keyword = ref('')
const page = ref({
  pn: 1,
  ps: 25,
  count: 0,
})
const scrollRef = ref(null)

// 滚动加载
useInfiniteScroll(
  scrollRef,
  async () => {
    if (page.value.pn * page.value.ps >= page.value.count)
      return
    getSongs({ mid: PLstore.currentSinger, pn: page.value.pn + 1 })
  },
  { distance: 50 },
)

function getSongs(params) {
  loading.value = true
  getUserArc(params).then((res) => {
    const content = res.data
    const { page: c_page, list } = content
    const videoList = list.vlist.map(item => ({
      id: item.bvid,
      eno_song_type: 'bvid',
      cover: `${item.pic}`,
      title: item.title,
      description: item.description,
      author: item.author,
      duration: item.duration || 0, // 暂无
      bvid: item.bvid,
    }))
    page.value = c_page
    songListByPage.value[c_page.pn] = videoList
  }).finally(() => {
    loading.value = false
  })
}

watch(() => PLstore.currentSinger, (mid) => {
  PLstore.fetchSingerInfo(mid, false)
  songListByPage.value = {}
  getSongs({ mid })
})
function handlePlayUser() {
  store.playList = renderList.value
  store.play = renderList.value[0]
}
function startExportPoster() {
  PLstore.isShowPoster = true
  PLstore.posters = renderList.value.map(item => item.cover)
}
</script>

<template>
  <section class="w-full h-full overflow-y-auto scrollbar-styled bg-[#121212] relative" ref="scrollRef">
    <!-- 顶部背景 -->
    <div class="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#535353] to-[#121212] z-0 pointer-events-none"></div>

    <!-- 信息头 -->
    <div class="relative z-10 px-8 pt-6 flex items-end gap-6 pb-6">
      <img
        :src="info?.face"
        class="h-52 w-52 object-cover rounded-full shadow-2xl"
      >
      <div class="flex flex-col gap-2 mb-2 text-white">
        <div class="flex items-center gap-2 text-sm font-bold uppercase">
          <div class="i-mingcute:certificate-fill text-blue-400" v-if="info?.official?.role"></div>
          <span>{{ info?.official?.title || 'Verified Artist' }}</span>
        </div>
        <h1 class="text-7xl font-black tracking-tighter">
          {{ info?.name }}
        </h1>
        <div class="flex items-center gap-4 text-sm font-medium mt-4">
           <span>{{ page.count }} 首歌曲</span>
           <a 
             :href="`https://space.bilibili.com/${PLstore.currentSinger}`" 
             target="_blank"
             class="hover:underline opacity-80 hover:opacity-100 flex items-center gap-1"
           >
              Bilibili 主页 <div class="i-mingcute:external-link-line"></div>
           </a>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="sticky top-0 z-20 bg-[#121212] px-8 py-4 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <div 
           class="w-14 h-14 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 hover:bg-[#1ed760] transition-all"
           @click="handlePlayUser"
         >
            <div class="i-mingcute:play-fill text-black text-3xl pl-1"></div>
         </div>
         
         <button
          class="px-4 py-1.5 rounded-full border border-[#727272] hover:border-white text-sm font-bold hover:scale-105 transition-all text-white uppercase tracking-wider"
          @click="startExportPoster"
        >
          Export Poster
        </button>

        <div class="i-mingcute:more-2-fill text-3xl text-[#b3b3b3] hover:text-white cursor-pointer transition-colors"></div>
      </div>

      <!-- 搜索 -->
      <div class="relative group">
        <div class="i-mingcute:search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white z-10" />
        <input
          v-model="keyword"
          placeholder="搜索歌曲"
          type="text"
          class="w-48 h-9 pl-9 pr-4 rounded-full bg-[#282828] hover:bg-[#2a2a2a] focus:bg-[#333] text-sm text-white outline-none transition-all placeholder:text-gray-500"
          @keyup.enter="getSongs({ mid: PLstore.currentSinger, keyword })"
        >
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="px-8 pb-10">
      <h2 class="text-2xl font-bold text-white mb-4">热门歌曲</h2>
      <div class="flex flex-col">
         <div class="grid grid-cols-[auto_1fr_1fr_auto] gap-4 text-[#b3b3b3] text-sm border-b border-[#ffffff1a] pb-2 mb-4 px-4">
            <div class="text-center w-8">#</div>
            <div>标题</div>
            <div>描述</div>
            <div class="i-mingcute:time-line text-lg"></div>
         </div>
         <SongItem 
           v-for="(song, index) in renderList" 
           :key="song.id" 
           :song="song" 
           class="hover:bg-[#ffffff1a] rounded-md px-2"
         >
         </SongItem>
      </div>
      <Loading v-if="loading && !renderList.length" class="mt-10" />
    </div>
  </section>
</template>

<style scoped>
/* 自定义 SongItem 样式覆盖 */
:deep(.song-item) {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 1rem;
  padding: 0.5rem 1rem;
}
</style>
