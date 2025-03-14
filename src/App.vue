<!-- eslint-disable no-console -->
<script setup>
import './styles/index.ts'
import {useDemoStore} from './blbl/demoStore.ts'
import { ref, onMounted, provide, computed, watch, nextTick, onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue'
// 第三方库
import { useLocalStorage } from '@vueuse/core'
import router from './router'

// 组件
import Play from './components/Play/Play.vue'
import Sider from './components/Sider.vue'
import WallpaperGen from './components/wallpaper-gen/index.vue'

// 播放列表相关
// import Playlist from './playlist/index.vue'
// import AddSong from './playlist/AddSong.vue'

// 页面
// import About from './pages/About.vue'
// import Setting from './pages/Setting.vue'
// import Home from './pages/Home/index.vue'
// import Search from './pages/Search.vue'
// import ListenLater from './pages/ListenLater.vue'
// import SingerList from './pages/Singer/SingerList.vue'
// import SingerDetail from './pages/Singer/SingerDetail.vue'

// API 和 Store
// import { useBlblStore } from './blbl/store.ts'
// import { usePlaylistStore } from './playlist/store'
// import { getUserInfo } from './api'

// const store = useBlblStore()
// const PLstore = usePlaylistStore()
// const CST = useLocalStorage('cookieSetTime', 0)
const userInfo = ref({})

onMounted(() => {

})
provide('userInfo', userInfo)
</script>

<template>
  <main
    class="
    bg-$eno-bg
    color-$eno-text-1 no-scroll" h-screen w-screen overflow="hidden" flex
  >
    <!-- <AddSong /> -->
    <Sider />
    <div class="grow-1 shrink-10 h-screen fadeInWrapper">
      <router-view></router-view>
    </div>
    <!-- <Play /> -->
    <!-- <WallpaperGen /> -->
  </main>
</template>

<style>
.no-scroll {
  overflow: hidden;
  overscroll-behavior: none;  /* 防止滚动链接/弹性效果 */
  touch-action: none;         /* 防止移动端的触摸滚动 */
  -webkit-overflow-scrolling: auto;  /* 禁用 iOS 的弹性滚动 */
  position: fixed;            /* 可选：完全固定位置 */
  width: 100%;
  height: 100%;
}
html {
  background: #000;
}

*::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  *::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 3px;
  }

  *::-webkit-scrollbar-thumb {
    cursor: pointer;
    background: #333;
    border-radius: 3px;

    &:hover {
      background: #444;
    }
  }

img {
  position: relative;

  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    background-image: url("/assets/broken-image.png");
    background-size: 25px;
    background-position: center;
    background-repeat: no-repeat;
  }
}

.fadeInWrapper>* {
  animation: fadeIn 0.5s;
}

.fadeItem {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
