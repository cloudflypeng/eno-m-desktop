<script setup>
import { computed, onMounted, inject, watch } from 'vue'
import { usePlaylistStore } from './store'
import BLFav from './BL-Fav.vue'

const userInfo = inject('userInfo')
const PLStore = usePlaylistStore()

watch(userInfo, () => {
  if (!userInfo.value.mid) return
  PLStore.fetchFavLists(userInfo.value.mid)
})

onMounted(() => {
  if (userInfo.value.mid) {
    PLStore.fetchFavLists(userInfo.value.mid)
  }
})
</script>

<template>
  <div class="w-full h-full bg-[#121212] overflow-y-auto overflow-x-hidden scrollbar-styled">
    <!-- 固定顶部背景 -->
    <div 
      class="fixed top-0 left-0 w-full h-48 bg-gradient-to-b from-[#1db954]/10 via-[#121212]/50 to-[#121212] pointer-events-none"
    />

    <!-- 内容区域 -->
    <div class="w-full max-w-7xl mx-auto px-8 py-12">
      <!-- 标题 -->
      <div class="mb-12 mt-6">
        <h2 class="text-4xl font-black text-white mb-2 tracking-tight">
          我的收藏
        </h2>
        <p class="text-gray-400 text-sm">
          {{ PLStore.favList.length + PLStore.collectedFavList.length }} 个收藏夹
        </p>
      </div>

      <!-- 我创建的收藏夹 -->
      <div class="mb-16">
        <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div class="w-1 h-8 bg-gradient-to-b from-[#1db954] to-transparent rounded-full" />
          我创建的收藏夹
        </h3>
        <div v-if="PLStore.favList.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 auto-rows-max">
          <BLFav v-for="fav in PLStore.favList" :key="fav.id" :fav="fav" />
        </div>
        <div v-else class="text-gray-500 text-center py-12">
          <div class="i-mingcute:inbox-line text-4xl mb-3 opacity-50" />
          <p>暂无创建的收藏夹</p>
        </div>
      </div>

      <!-- 收藏的合集和列表 -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div class="w-1 h-8 bg-gradient-to-b from-[#1db954] to-transparent rounded-full" />
          收藏的合集和列表
        </h3>
        <div v-if="PLStore.collectedFavList.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 auto-rows-max">
          <BLFav v-for="fav in PLStore.collectedFavList" :key="fav.id" :fav="fav" />
        </div>
        <div v-else class="text-gray-500 text-center py-12">
          <div class="i-mingcute:inbox-line text-4xl mb-3 opacity-50" />
          <p>暂无收藏的内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 复用全局滚动条样式 */
</style>
