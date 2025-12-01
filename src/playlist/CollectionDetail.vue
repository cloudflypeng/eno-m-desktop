<script lang="ts" setup>
import { useInfiniteScroll } from '@vueuse/core'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import SongItem from '~/components/SongItem.vue'
// @ts-ignore
import { invokeBiliApi, BLBL } from '~/api/bili'

import { useBlblStore } from '~/blbl/store'
import { usePlaylistStore, type song } from '~/playlist/store'
import Loading from '~/components/loading/index.vue'
// @ts-ignore
import Message from '~/components/message'

const route = useRoute()
const PLstore = usePlaylistStore()
const store = useBlblStore()

const currentCollectionId = computed(() => {
  const id = route.params.collectionId
  console.log('collectionId from route:', id)
  return id ? String(id) : ''
})
const currentMid = computed(() => {
  const mid = route.query.mid
  console.log('mid from query:', mid)
  return mid ? String(mid) : ''
})
const collectionType = computed(() => {
  const type = route.query.type
  console.log('type from query:', type)
  return (type === 'series' ? 'series' : 'collection') as 'series' | 'collection'
})

const collectionInfo = ref<any>(null)
const songListByPage = ref<Record<number, song[]>>({})
const renderList = computed(() => {
  return Object.values(songListByPage.value).flat() as song[]
})

const loading = ref(false)
const keyword = ref('')
const page = ref({
  pn: 1,
  ps: 30,
  count: 0,
})
const listRef = ref(null)

// 滚动加载
useInfiniteScroll(
  listRef,
  async () => {
    // 如果数据都已加载或总数小于单页大小，无需加载更多
    if (loading.value || renderList.value.length >= page.value.count)
      return
    
    if (Object.keys(songListByPage.value).length === 0) return

    await getVideos({ page_num: page.value.pn + 1 })
  },
  { distance: 50 }
)

async function getVideos(params: Record<string, any>) {
  if (loading.value) return
  loading.value = true
  try {
    let res: any
    
    // 使用 GET_SEASONS_SERIES_LIST 来获取用户的所有合集和系列
    // 然后找到匹配的那个，从中获取视频列表
    res = await invokeBiliApi(BLBL.GET_SEASONS_SERIES_LIST, {
      mid: currentMid.value,
      page_num: params.page_num || 1,
      page_size: 20,  // 增大页数以获取足够的合集/系列
    })

    console.log('Fetched seasons/series list:', res)
    
    // 从返回的列表中找到匹配的合集或系列
    let targetCollection = null
    const itemsLists = res.data?.items_lists || {}
    const allItems = [...(itemsLists.seasons_list || []), ...(itemsLists.series_list || [])]
    
    for (const item of allItems) {
      if (String(item.meta?.season_id || item.meta?.series_id) === String(currentCollectionId.value)) {
        targetCollection = item
        break
      }
    }
    
    if (!targetCollection) {
      console.error('Collection not found in list')
      Message.show({
        type: 'error',
        message: '合集未找到'
      })
      loading.value = false
      return
    }

    console.log('Found target collection:', targetCollection)
    
    // 从 targetCollection 中提取视频列表
    const archives = targetCollection.archives || []
    const videoList: song[] = archives.map((item: any) => ({
      id: item.bvid || item.bv_id,
      eno_song_type: 'bvid',
      cover: item.pic,
      title: item.title,
      description: item.intro || '',
      author: item.upper?.name || '未知创作者',
      duration: item.duration || 0,
      bvid: item.bvid || item.bv_id,
      aid: item.aid,
    }))
    
    // 更新信息
    collectionInfo.value = targetCollection.meta || {}
    page.value = {
      pn: 1,
      ps: 30,
      count: videoList.length,
    }
    
    songListByPage.value = {
      [1]: videoList
    }
  } catch (e) {
    console.error('Failed to fetch collection videos:', e)
    Message.show({
      type: 'error',
      message: '加载视频失败'
    })
  } finally {
    loading.value = false
  }
}

watch(() => [currentCollectionId.value, currentMid.value, collectionType.value], ([collectionId, mid, type]) => {
  if (!collectionId || !mid) {
    console.log('Missing params:', { collectionId, mid, type })
    return
  }
  console.log('Watch triggered with:', { collectionId, mid, type })
  songListByPage.value = {}
  page.value.pn = 1
  loading.value = false 
  getVideos({ page_num: 1 })
}, { immediate: true })

function handlePlayPlaylist() {
  store.playList = renderList.value as any
  store.play = renderList.value[0] as any
}

function handleRemoveSong(song: song) {
  // 合集和列表通常不支持移除操作，这里可选实现
  console.log('Remove song:', song)
}
</script>

<template>
  <!-- 页面主容器 -->
  <div class="w-full h-[calc(80vh)] flex flex-col bg-[#121212] relative overflow-hidden">
    
    <!-- 顶部背景渐变 -->
    <div 
      class="absolute top-0 left-0 w-full h-[300px] z-0 pointer-events-none"
      style="background: linear-gradient(to bottom, #2a2a2a, #121212)"
    ></div>

    <!-- 固定头部区域 -->
    <div class="shrink-0 relative z-10">
      <!-- 信息头 -->
      <div class="px-8 pt-6 flex items-end gap-6 pb-6">
        <div class="h-52 w-52 rounded-lg bg-gradient-to-br from-[#1db954] to-[#1aa34a] flex items-center justify-center shadow-2xl">
          <div class="i-mingcute:folder-fill text-white text-8xl opacity-50" />
        </div>
        <div class="flex flex-col gap-2 mb-2 text-white">
          <div class="text-sm font-bold uppercase text-[#1db954]">
            {{ collectionType === 'series' ? '系列' : '合集' }}
          </div>
          <h1 class="text-7xl font-black tracking-tighter">
            {{ collectionInfo?.name }}
          </h1>
          <div class="flex items-center gap-4 text-sm font-medium mt-4">
            <span>{{ page.count }} 个视频</span>
            <span v-if="collectionInfo?.description" class="text-gray-400">
              {{ collectionInfo.description }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="bg-[#121212] px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div 
            class="w-14 h-14 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 hover:bg-[#1ed760] transition-all"
            @click="handlePlayPlaylist"
          >
            <div class="i-mingcute:play-fill text-black text-3xl pl-1"></div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="relative group">
          <div class="i-mingcute:search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white z-10" />
          <input
            v-model="keyword"
            placeholder="搜索视频"
            type="text"
            class="w-48 h-9 pl-9 pr-4 rounded-full bg-[#282828] hover:bg-[#2a2a2a] focus:bg-[#333] text-sm text-white outline-none transition-all placeholder:text-gray-500"
            @keyup.enter="getVideos({ page_num: 1 })"
          >
        </div>
      </div>
    </div>

    <!-- 表头 -->
    <div class="grid grid-cols-[3rem_3.5rem_1fr_4rem_3rem] gap-4 text-[#b3b3b3] text-sm border-b border-[#ffffff1a] pb-2 px-12">
      <div class="text-center">#</div>
      <div></div>
      <div>标题</div>
      <div class="i-mingcute:time-line text-lg justify-self-end mr-4"></div>
      <div></div>
    </div>

    <!-- 视频列表 (滚动区域) -->
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
          :del="false"
          class="hover:bg-[#ffffff1a] rounded-md px-2"
          @delete-song="handleRemoveSong"
        >
        </SongItem>
      </div>
      <Loading v-if="loading && !renderList.length" class="mt-10" />
      <div class="h-10"></div>
    </div>
  </div>
</template>

<style scoped>
:deep(.song-item) {
  grid-template-columns: 3rem 3.5rem 1fr 4rem 3rem !important;
  padding: 0.5rem 1rem;
}
</style>
