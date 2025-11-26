<script setup>
import { onMounted } from 'vue'
import { usePlaylistStore } from '../../playlist/store'
import { useBlblStore } from '../../blbl/store'
import SingerItem from '~/components/SingerItem.vue'
import { useRouter } from 'vue-router'

const store = useBlblStore()
const PLstore = usePlaylistStore()
const router = useRouter()

onMounted(() => {
  store.initHomePage()
})

function goToRank() {
  router.push('/rank')
}
</script>

<template>
  <section class="w-full h-full overflow-auto pb-30 scrollbar-hide px-6 pt-6 bg-[#121212]">
    <!-- 顶部欢迎语 (可选) -->
    <h2 class="text-3xl font-bold text-white mb-6">Good evening</h2>

    <!-- 推荐板块 (Bilibili Music Rank 入口) -->
    <div class="flex mb-8">
      <!-- Bilibili Music Rank Card -->
      <div 
        class="flex items-center bg-[#282828] hover:bg-[#3e3e3e] rounded-md overflow-hidden cursor-pointer transition-colors group h-20 shadow-lg"
        @click="goToRank"
      >
        <div class="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-md">
           <div class="i-mingcute:music-2-fill text-3xl text-white" />
        </div>
        <div class="flex items-center justify-between w-full px-4">
           <span class="font-bold text-white text-base">Bilibili Music Rank</span>
           <div class="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105">
              <div class="i-mingcute:play-fill text-black text-xl pl-1" />
           </div>
        </div>
      </div>
      <!-- 这里可以放置其他入口，例如 "我的收藏", "最近播放" 等 -->
    </div>

    <!-- 关注的歌手 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold text-white hover:underline cursor-pointer">
          关注的歌手
        </h3>
        <span 
          class="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer uppercase tracking-wider"
          @click="$router.push('/singerList')"
        >
          Show all
        </span>
      </div>
      
      <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 overflow-hidden">
        <!-- 只显示前几个 -->
        <SingerItem 
          v-for="serid in PLstore.singers.slice(0, 5)" 
          :key="serid" 
          :singer-mid="serid" 
        />
      </div>
    </div>

  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
