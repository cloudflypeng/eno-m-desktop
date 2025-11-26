<script setup>
import { ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import cn from 'classnames'

import SongItem from '~/components/SongItem.vue'
import Loading from '~/components/loading/index.vue'
import { invokeBiliApi, BLBL } from '~/api/bili'

const scrollRef = ref(null)
const pageNum = ref(1)

const keyword = ref('')
const result = ref([])
const isLoading = ref(false)
// 单个搜索结果过少时不触发滚动加载
const enableScrollGetMore = ref(true)

function isUrl(url) {
  return /bilibili.com/.test(url)
}

// 滚动加载
useInfiniteScroll(
  scrollRef,
  async () => {
    if (!enableScrollGetMore.value)
      return
    const moreData = await getMoreData()
    if (moreData && moreData.length) {
      result.value = result.value.concat(moreData)
    }
  },
  { distance: 10 },
)

// 加载函数
async function getMoreData() {
  isLoading.value = true
  pageNum.value++
  
  try {
    const res = await invokeBiliApi(BLBL.SEARCH, {
      keyword: keyword.value,
      page: pageNum.value,
    })
    
    isLoading.value = false
    
    const list = res.data?.result || []

    return list.map((item) => {
      let cover = item.pic
      if (cover && cover.startsWith('//')) {
        cover = 'http:' + cover
      }
      
      return {
        id: item.id || item.bvid,
        eno_song_type: 'bvid',
        cover,
        title: item.title ? item.title.replace(/<[^>]+>/g, '') : '',
        description: item.description || item.desc,
        author: item.author || item.owner?.name || '未知',
        duration: item.duration,
        bvid: item.bvid,
        pages: item.pages,
        mid: item.mid,
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    isLoading.value = false
    return []
  }
}

// 搜索
async function handleSearch() {
  if (!keyword.value) return
  
  enableScrollGetMore.value = true
  
  if (isUrl(keyword.value)) {
    const match = keyword.value.match(/BV([a-zA-Z0-9]+)/)
    if (match) {
      const bvid = match[0]
      // 获取对应的歌曲
      try {
        isLoading.value = true
        const res = await invokeBiliApi(BLBL.GET_VIDEO_INFO, { bvid })
        isLoading.value = false
        console.log(res)
        const item = res.data
        if (item) {
          const searchSong = {
            id: item.id || item.bvid,
            eno_song_type: 'bvid',
            cover: item.pic,
            title: item.title,
            description: item.description || item.desc,
            author: item.author || item.owner?.name || '未知',
            duration: item.duration,
            bvid: item.bvid,
            pages: item.pages,
            mid: item.owner?.mid || item.mid,
          }

          result.value = [searchSong]
          enableScrollGetMore.value = false
        }
      } catch (e) {
        console.error(e)
        isLoading.value = false
      }
    }
  }
  else {
    pageNum.value = 0
    result.value = []
    const newList = await getMoreData()
    result.value = newList
  }
}
</script>

<template>
  <section class="w-full h-full flex flex-col pt-6 px-8 bg-[#121212]">
    <!-- 搜索输入框 -->
    <div class="w-[364px] relative flex gap-3 mb-6 text-black">
      <div class="absolute top-1/2 left-3 -translate-y-1/2 z-10 pointer-events-none">
         <div class="i-mingcute:search-line text-xl text-[#121212]" />
      </div>
      <input
        id="search" 
        v-model="keyword" 
        type="text" 
        class="w-full h-12 pl-10 pr-4 rounded-full bg-white outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-[#757575]" 
        placeholder="想听什么？" 
        @keyup.enter="handleSearch"
      >
      <Loading v-if="isLoading" class="absolute right-4 top-1/2 -translate-y-1/2" />
    </div>

    <!-- 搜索结果 -->
    <div 
      v-if="result.length" 
      ref="scrollRef" 
      class="flex-1 w-full overflow-y-auto scrollbar-styled pb-8"
    >
      <div class="grid grid-cols-[auto_1fr_1fr_auto] gap-4 text-[#b3b3b3] text-sm border-b border-[#ffffff1a] pb-2 mb-4 px-4 sticky top-0 bg-[#121212] z-10">
        <div class="text-center w-8">#</div>
        <div>标题</div>
        <div>UP主</div>
        <div class="i-mingcute:time-line text-lg"></div>
      </div>

      <SongItem 
        v-for="(item, index) in result" 
        :key="item.bvid" 
        :song="item" 
        check-pages 
        class="hover:bg-[#ffffff1a] rounded-md px-2"
      />
    </div>

    <!-- 初始状态/空状态 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-[#b3b3b3] gap-4">
      <div class="i-mingcute:music-2-fill text-6xl opacity-50"></div>
      <div class="text-center">
        <h3 class="font-bold text-white mb-2">搜索 Bilibili 视频或音频</h3>
        <p class="text-sm">输入关键字、BV号或视频链接即可开始</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 自定义 SongItem 在列表中的样式适配 */
:deep(.song-item) {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
}
</style>
