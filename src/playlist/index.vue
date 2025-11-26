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
  <div class="p-10 h-full overflow-auto pb-25 scrollbar-styled bg-[#121212]">
    
    <h3 class="text-2xl font-bold my-4 text-white">
      我创建的收藏夹
    </h3>
    <div v-if="PLStore.favList.length" class="flex flex-col gap-2">
      <BLFav v-for="fav in PLStore.favList" :key="fav.id" :fav="fav" />
    </div>
    <div v-else class="text-gray-500">
      暂无创建的收藏夹
    </div>

    <h3 class="text-2xl font-bold mt-8 mb-4 text-white">
      收藏的合集和列表
    </h3>
    <div v-if="PLStore.collectedFavList.length" class="flex flex-col gap-2">
      <BLFav v-for="fav in PLStore.collectedFavList" :key="fav.id" :fav="fav" />
    </div>
    <div v-else class="text-gray-500">
      暂无收藏的内容
    </div>
  </div>
</template>

<style scoped>
/* 复用全局滚动条样式 */
</style>
