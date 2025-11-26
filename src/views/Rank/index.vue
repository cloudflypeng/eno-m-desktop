<script setup>
import { computed, onMounted } from 'vue'
import { cloneDeep } from 'lodash'
import { useBlblStore } from '~/blbl/store'

const store = useBlblStore()

onMounted(() => {
  if (!store.musicRankList.length) {
    store.initHomePage()
  }
})

function handlePlayRank() {
  store.playList = cloneDeep(store.musicRankList)
  store.play = store.musicRankList[0] || {}
}

const mainSong = computed(() => {
  return store.musicRankList[0]
})
</script>

<template>
  <section class="w-full h-full overflow-auto pb-30 scrollbar-styled bg-[#121212]">
    <!-- 顶部 Banner 区域 (主榜单推荐) -->
    <div class="relative w-full p-6 bg-gradient-to-b from-[#535353] to-[#121212]">
      <div class="flex gap-6 items-end">
        <!-- 主图 -->
        <div class="w-[232px] h-[232px] shadow-xl flex-shrink-0 group relative cursor-pointer" @click="handlePlayRank">
          <img v-if="mainSong" class="w-full h-full object-cover rounded shadow-lg" :src="mainSong.cover">
          <div v-else class="w-full h-full bg-[#282828] flex items-center justify-center rounded shadow-lg">
             <div class="i-mingcute:music-2-fill text-6xl text-gray-500" />
          </div>
          <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
             <div class="w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg transform scale-100 hover:scale-105 transition-all">
                <div class="i-mingcute:play-fill text-black text-2xl pl-1"></div>
             </div>
          </div>
        </div>
        
        <!-- 榜单信息 -->
        <div class="flex flex-col gap-4 mb-2">
          <div class="text-xs font-bold uppercase tracking-wider text-white">Playlist</div>
          <h1 class="text-6xl font-black tracking-tighter shadow-sm text-white">Bilibili Music Rank</h1>
          <div class="flex items-center gap-2 text-sm font-medium text-white/80">
             <span>每周五 18:00 更新</span>
             <span class="w-1 h-1 bg-white rounded-full"></span>
             <span>{{ store.musicRankList.length }} 首歌曲</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="bg-[#121212] px-6 py-4 flex items-center gap-6 sticky top-0 z-10">
       <div 
         class="w-14 h-14 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 hover:bg-[#1ed760] transition-all"
         @click="handlePlayRank"
       >
          <div class="i-mingcute:play-fill text-black text-3xl pl-1"></div>
       </div>
       <div class="i-mingcute:heart-line text-3xl text-[#b3b3b3] hover:text-white cursor-pointer transition-colors"></div>
       <div class="i-mingcute:more-2-fill text-3xl text-[#b3b3b3] hover:text-white cursor-pointer transition-colors"></div>
    </div>

    <!-- 榜单列表 -->
    <div class="px-6 pb-8 bg-[#121212]">
      <div class="grid grid-cols-[auto_1fr_1fr_auto] gap-4 text-[#b3b3b3] text-sm border-b border-[#ffffff1a] pb-2 mb-4 px-4 sticky top-[88px] z-10 bg-[#121212]">
        <div class="text-center w-8">#</div>
        <div>标题</div>
        <div>UP主</div>
        <div class="i-mingcute:time-line text-lg"></div>
      </div>

      <div class="flex flex-col">
        <div 
          v-for="(song, index) in store.musicRankList" 
          :key="song.id" 
          class="group grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-2 hover:bg-[#ffffff1a] rounded-md transition-colors cursor-pointer"
          @click="store.startPlay(song)"
        >
          <div class="w-8 text-center text-[#b3b3b3] relative h-4">
             <span class="group-hover:opacity-0">{{ index + 1 }}</span>
             <div class="i-mingcute:play-fill absolute top-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-white"></div>
          </div>
          
          <div class="flex items-center gap-3 overflow-hidden">
            <img :src="song.cover" class="w-10 h-10 rounded object-cover flex-shrink-0">
            <div class="flex flex-col overflow-hidden">
               <span class="text-white font-medium truncate text-base">{{ song.title }}</span>
            </div>
          </div>

          <div class="truncate text-sm group-hover:text-white transition-colors text-[#b3b3b3]">{{ song.author }}</div>
          
          <div class="text-sm font-variant-numeric tabular-nums text-[#b3b3b3]">
             <!-- 暂时用随机数模拟时长，真实数据需要 API 支持 -->
             {{ '3:42' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

