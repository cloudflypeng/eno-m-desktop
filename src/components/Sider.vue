<script setup>
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import cn from 'classnames'
import Dialog from '../components/dialog/index.vue'
// import { usePlaylistStore } from '../playlist/store'
import TabItem from './TabItem.vue'


const tabs = [
  { icon: 'i-tabler:smart-home', title: '首页', mode: 'home' },
  { icon: 'i-tabler:music-search', title: '搜索', mode: 'search' },
  { icon: 'i-mingcute:version-line', title: '媒体库', mode: 'playlist' },
  { icon: 'i-tabler:user-star', title: '关注的音乐人', mode: 'singerList' },

]


// 侧边栏展开相关代码
const open = useLocalStorage('sider-open', false)
const asideClass = computed(() => {
  return cn('w-16 h-full flex flex-col gap-1 flex-shrink-0 flex-grow-0 text-lg p-3 px-2 border-r border-r-$eno-fill-2 relative', {
    'w-60': open.value,
  })
})
const tabClass = computed(() => {
  return cn('tab-item flex w-full gap-3 text-2xl items-center h-10 cursor-pointer hover:bg-$eno-fill-2 rounded-2 pl-3', {
  })
})

</script>

<template>
  <!-- 增加动画持续时间 -->
  <aside :class="asideClass" transition-all duration-300>
    <!-- logo and close -->
    <div
      class="flex items-center h-10 gap-3 tab-item cursor-pointer"
      @click="open = !open"
    >
      <div v-if="open" class="i-mingcute:indent-decrease-fill w-1em h-1em ml-3" />
      <div v-else class="i-mingcute:indent-increase-fill w-1em h-1em ml-3" />
      <span v-if="open" class="text-lg">ENO-M</span>
    </div>
    <!-- tab区 -->
    <TabItem v-for="tab in tabs" :key="tab.mode" :tab="tab" :open="open"/>
    <!-- 分割线 -->
    <div class="h-0.5 bg-$eno-fill-2" />
  </aside>
</template>

<style>
.tab-item>*:nth-child(2) {
  /* display: none; */
  width: 0;
  overflow: hidden;
  text-wrap: nowrap;
  animation: widthAni 0.5s forwards;
}
@keyframes widthAni {
  from{
    width: 0;
    opacity: 0;
  }
  to{
    width: calc(100% - 5em);
    opacity: 1;
  }
}
</style>
