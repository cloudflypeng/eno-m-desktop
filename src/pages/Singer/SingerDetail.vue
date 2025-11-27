<script setup>
import { useInfiniteScroll } from '@vueuse/core'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import SongItem from '~/components/SongItem.vue'
import { invokeBiliApi, BLBL } from '~/api/bili'

import { useBlblStore } from '~/blbl/store.ts'
import { usePlaylistStore } from '~/playlist/store'
import Loading from '~/components/loading/index.vue'
import { average } from 'color.js'

const route = useRoute()
const PLstore = usePlaylistStore()
const store = useBlblStore()

const currentMid = computed(() => route.params.mid || '')

const info = computed(() => {
  return PLstore.singerCardCache[currentMid.value]
})

const headerColor = ref('#535353') // 默认颜色

// 提取主题色
watch(info, async (newInfo) => {
  if (newInfo?.face) {
    try {
      // 使用 crossOrigin 防止跨域问题 (虽然B站图片有防盗链，但electron环境可能好些，或者需要代理)
      // 这里我们直接传 url，color.js 会尝试加载
      const color = await average(newInfo.face, { amount: 1, format: 'hex' })
      // color.js 返回的是 hex 字符串，或者是数组
      if (typeof color === 'string') {
        headerColor.value = color
      } else if (Array.isArray(color)) {
          // 如果是 rgb 数组
          // headerColor.value = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      }

    } catch (e) {
      console.warn('Failed to extract color:', e)
      headerColor.value = '#535353'
    }
  }
}, { immediate: true })

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
const listRef = ref(null)

// 滚动加载 - 绑定到具体的列表容器
useInfiniteScroll(
  listRef,
  async () => {
    // 如果正在加载中，或者已经没有更多数据
    if (loading.value || (page.value.count > 0 && page.value.pn * page.value.ps >= page.value.count))
      return
    
    // 避免初始为空时触发（由 watch 负责）
    if (Object.keys(songListByPage.value).length === 0) return

    await getSongs({ mid: currentMid.value, pn: page.value.pn + 1 })
  },
  { distance: 50 }
)

async function getSongs(params) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await invokeBiliApi(BLBL.GET_USER_ARC, params)
    const content = res.data
    const { page: c_page, list } = content
    const videoList = list.vlist.map(item => ({
      id: item.bvid,
      eno_song_type: 'bvid',
      cover: `${item.pic}`,
      title: item.title,
      description: item.description,
      author: item.author,
      duration: item.length || 0,
      bvid: item.bvid,
    }))
    
    page.value = {
      pn: c_page.pn,
      ps: c_page.ps,
      count: c_page.count
    }
    
    songListByPage.value = {
      ...songListByPage.value,
      [c_page.pn]: videoList
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => currentMid.value, (mid) => {
  if (!mid) return
  PLstore.fetchSingerInfo(mid, true)
  songListByPage.value = {}
  page.value.pn = 1
  loading.value = false 
  getSongs({ mid })
}, { immediate: true })

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
  <!-- 页面主容器：占据 100% 高度，Flex 布局 -->
  <div class="w-full h-[calc(80vh)] flex flex-col bg-[#121212] relative overflow-hidden">
    
    <!-- 顶部背景 -->
    <div 
      class="absolute top-0 left-0 w-full h-[300px] z-0 pointer-events-none transition-colors duration-500 ease-in-out"
      :style="{ background: `linear-gradient(to bottom, ${headerColor}, #121212)` }"
    ></div>

    <!-- 固定头部区域 (不滚动) -->
    <div class="shrink-0 relative z-10">
      <!-- 信息头 -->
      <div class="px-8 pt-6 flex items-end gap-6 pb-6">
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
               :href="`https://space.bilibili.com/${currentMid}`" 
               target="_blank"
               class="hover:underline opacity-80 hover:opacity-100 flex items-center gap-1"
             >
                Bilibili 主页 <div class="i-mingcute:external-link-line"></div>
             </a>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="bg-[#121212] px-8 py-4 flex items-center justify-between">
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
        </div>

        <!-- 搜索 -->
        <div class="relative group">
          <div class="i-mingcute:search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white z-10" />
          <input
            v-model="keyword"
            placeholder="搜索歌曲"
            type="text"
            class="w-48 h-9 pl-9 pr-4 rounded-full bg-[#282828] hover:bg-[#2a2a2a] focus:bg-[#333] text-sm text-white outline-none transition-all placeholder:text-gray-500"
            @keyup.enter="getSongs({ mid: currentMid, keyword })"
          >
        </div>
      </div>
    </div>
    <div class="grid grid-cols-[3rem_3.5rem_1fr_4rem_3rem] gap-4 text-[#b3b3b3] text-sm border-b border-[#ffffff1a] pb-2 px-12">
      <div class="text-center">#</div>
      <div></div>
      <div>标题</div>
      <div class="i-mingcute:time-line text-lg justify-self-end mr-4"></div>
      <div></div>
    </div>
    <!-- 歌曲列表 (滚动区域) -->
    <div 
      class="flex-1 overflow-y-auto scrollbar-styled px-8 py-4 pb-10 z-10 min-h-0" 
      ref="listRef"
    >
      <div class="flex flex-col">
         <SongItem 
           v-for="(song, index) in renderList" 
           :key="song.id" 
           :song="song" 
           :index="index + 1"
           class="hover:bg-[#ffffff1a] rounded-md px-2"
         >
         </SongItem>
      </div>
      <Loading v-if="loading && !renderList.length" class="mt-10" />
      <!-- 底部占位，防止最后的内容被遮挡 -->
      <div class="h-10"></div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义 SongItem 样式覆盖 */
:deep(.song-item) {
  /* 强制对齐 header */
  grid-template-columns: 3rem 3.5rem 1fr 4rem 3rem !important;
  padding: 0.5rem 1rem;
}
</style>
