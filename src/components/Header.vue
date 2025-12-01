<script setup lang="ts">
import { useRouter } from 'vue-router'
import { inject } from 'vue'

const router = useRouter()
const userInfo = inject('userInfo', null) as any

function goBack() {
  router.back()
}

function goForward() {
  router.forward()
}
</script>

<template>
  <div class="flex items-center gap-4 h-16 px-6 sticky top-0 z-10 bg-transparent">
    <div class="flex gap-2">
      <button 
        class="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70 text-white transition-colors"
        @click="goBack"
      >
        <div class="i-mingcute:left-line text-xl" />
      </button>
      <button 
        class="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70 text-white transition-colors"
        @click="goForward"
      >
        <div class="i-mingcute:right-line text-xl" />
      </button>
    </div>
    <!-- 这里可以预留搜索框或者用户信息的位置 -->
    <div class="flex-1" />
    <div v-if="userInfo?.isLogin" class="flex items-center gap-3">
      <img :src="userInfo?.face" alt="avatar" class="w-8 h-8 rounded-full border border-[#333]" />
      <span class="text-white text-sm">{{ userInfo?.uname }}</span>
    </div>
  </div>
</template>

