<script setup>
import { defaultSingers, usePlaylistStore } from '~/playlist/store'
import SingerItem from '~/components/SingerItem.vue'
import Dialog from '~/components/dialog/index.vue'
import { ref, onMounted } from 'vue'

// https://space.bilibili.com/17819768?spm_id_from=333.1007.tianma.1-1-1.click
function getMidFromUrl(url) {
  // 如果url 是纯数字, 则直接返回
  if (/^\d+$/.test(url)) {
    return url
  }
  const match = url.match(/space\.bilibili\.com\/(\d+)/)
  if (match) {
    return match[1]
  }
  return ''
}

const PLstore = usePlaylistStore()
onMounted(() => {
  PLstore.fetchSingerInfoList()
})

// 添加歌手相关
const dialogVis = ref(false)
const singerMid = ref('')
function addSinger() {
  // 判断是否已经存在, 判断singerMid是否合法
  const mid = getMidFromUrl(singerMid.value)
  if (!mid)
    return
  if (defaultSingers.includes(mid) || PLstore.singers.includes(mid))
    return

  PLstore.addSinger(mid)
  dialogVis.value = false
}
</script>

<template>
  <section class="w-full h-full overflow-y-auto scrollbar-styled px-8 pt-6 pb-8 bg-[#121212]">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-white">关注的音乐人</h2>
      <button 
        class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffffff1a] hover:bg-[#ffffff33] text-sm font-bold transition-colors"
        @click.stop="dialogVis = true"
      >
        <div class="i-mingcute:add-fill text-lg" />
        添加歌手
      </button>
    </div>

    <div class="flex flex-wrap gap-4">
      <SingerItem v-for="serid in PLstore.singers" :key="serid" :singer-mid="serid" can-del />
    </div>

    <Dialog :open="dialogVis" title="添加自定义歌手" @visible-change="dialogVis = $event">
      <div class="flex flex-col gap-4 w-full">
        <input
          v-model="singerMid" 
          placeholder="请输入歌手mid或up主主页链接" 
          class="h-10 px-4 border border-[#333] bg-[#282828] rounded text-white focus:border-white outline-none transition-colors"
        >
        <button class="w-full h-10 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors" @click="addSinger">
          添加
        </button>
      </div>
    </Dialog>
  </section>
</template>
