<script setup>
import cn from 'classnames'
import { usePlaylistStore } from '../playlist/store'
import { useBlblStore } from '../blbl/store'

const props = defineProps({
  singerMid: String,
  canDel: {
    type: Boolean,
    default: false,
  },
  shape: {
    type: String,
    default: 'circle',
  },
})
const store = useBlblStore()
const PLstore = usePlaylistStore()
const info = computed(() => PLstore.singerCardCache[props.singerMid])
const avatar = computed(() => info.value?.face || '')
const name = computed(() => info.value?.name || '')
const desc = computed(() => {
  const { name } = info.value?.nameplate || {}
  return `${name || '暂无'}`
})

function handleSingerDetail(singerMid) {
  store.mode = 'singerDetail'
  PLstore.currentSinger = singerMid
}
</script>

<template>
  <div
    class="flex flex-shrink-0 items-center justify-between
     w-80 h-20 rounded-lg px-4
     bg-$eno-elevated/80 backdrop-blur-sm
     shadow-sm border-b-0
     transition-all duration-300 ease-in-out
     hover:shadow-md
     hover:translate-y-[-2px]
     hover:border-b-2
     border-blue-500
     cursor-pointer group
    "
    @click.stop="handleSingerDetail(singerMid)"
  >
    <!-- 左侧信息区域 -->
    <div class="flex items-center space-x-4">
      <img
        :src="avatar"
        alt="singerAvatar"
        class="w-13 h-13 rounded-full
          border border-gray-200/10
          shadow-sm hover:shadow-md
          transition duration-300
          object-cover
        "
      >
      <div class="flex flex-col">
        <div class="text-[16px] font-medium tracking-wide">
          {{ name }}
        </div>
        <div class="text-[11px] text-gray-400/80 mt-0.5">
          {{ desc }}
        </div>
      </div>
    </div>

    <!-- 右侧操作区域 -->
    <div class="flex items-center gap-3 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
      <div
        v-if="canDel"
        class="i-mingcute:delete-line w-[18px] h-[18px]
          cursor-pointer hover:text-red-500
          transition-colors duration-200
          hover:scale-110
        "
        @click.stop="PLstore.removeSinger(singerMid)"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
