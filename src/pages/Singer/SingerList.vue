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
  <section class="page-inner relative">
    <!-- 顶部架构效果 -->
    <div class="fixed top-0 left-[280px] right-0 h-40 bg-gradient-to-b from-[#1db954]/5 via-[#121212]/20 to-[#121212] pointer-events-none -z-10" />
    
    <!-- 内容区域 -->
    <div class="relative z-10">
      <!-- 额标 -->
      <div class="mb-8 mt-4">
        <div class="flex items-end justify-between gap-6">
          <div>
            <h2 class="text-display mb-2">
              关注的音乐人
            </h2>
            <p class="text-body-small">
              {{ PLstore.singers.length }} 位音乐人
            </p>
          </div>
          <button 
            class="btn-primary"
            @click.stop="dialogVis = true"
          >
            <div class="flex items-center gap-2">
              <div class="i-mingcute:add-fill" />
              <span>添加歌手</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 歌手网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max">
        <SingerItem 
          v-for="mid in PLstore.singers" 
          :key="mid" 
          :singer-mid="mid" 
          type="card-modern"
          class="h-56"
          :can-del="true"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="!PLstore.singers.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="i-mingcute:user-star-line text-6xl mb-4 opacity-20" />
        <h3 class="text-heading-1 mb-2">暂无关注的音乐人</h3>
        <p class="text-body-small">点击上方按钮添加你喜欢的音乐人</p>
      </div>
    </div>
  </section>

  <!-- 添加歌手对话框 -->
  <Dialog :open="dialogVis" title="添加自定义歌手" @visible-change="dialogVis = $event">
    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-2">
        <label class="text-body font-medium">歌手空间 URL 或 ID</label>
        <input
          v-model="singerMid" 
          placeholder="https://space.bilibili.com/123456 或 123456" 
          class="h-10 px-4 border border-[#404040] bg-[#282828] rounded-lg text-white placeholder-gray-500 focus:border-[#1db954] focus:outline-none transition-colors"
          @keyup.enter="addSinger"
        >
      </div>
    </div>
    <template #footer>
      <button class="btn-ghost" @click="dialogVis = false">取消</button>
      <button class="btn-primary" @click="addSinger">添加</button>
    </template>
  </Dialog>
</template>
