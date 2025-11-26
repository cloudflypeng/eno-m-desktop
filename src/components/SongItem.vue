<script setup>
import { computed } from 'vue'
import cn from 'classnames'
import { useBlblStore } from '../blbl/store.ts'
import { usePlaylistStore } from '../playlist/store.ts'
// @ts-ignore
import { invokeBiliApi, BLBL } from '~/api/bili'
import Message from '~/components/message'
import { useRouter } from 'vue-router'

const props = defineProps({
  song: {
    type: Object,
    default: null,
  },
  size: {
    // default, mini
    type: String,
    default: 'default',
  },
  star: {
    type: Boolean,
    default: true,
  },
  del: {
    type: Boolean,
    default: false,
  },
  checkPages: {
    type: Boolean,
    default: false,
  },
  later: {
    type: Boolean,
    default: true,
  },
  showActive: {
    type: Boolean,
    default: true,
  },
  class: String
})

const emit = defineEmits(['delete-song'])

const router = useRouter()
const store = useBlblStore()
const PLstore = usePlaylistStore()

const { later, del, star, checkPages } = props
const { cover, title, author, pages, mid } = props.song

const isPlaying = computed(() => {
  if (!props.showActive)
    return false
  const current = store.play
  // 兼容原本的错别字
  const type = current.eno_song_type || current.enu_song_type

  if (type && current[type] === props?.song[type]) {
    return true
  }
  return false
})

const styleBySize = computed(() => {
  if (props.size === 'mini') {
    return {
      wrapper: `grid-cols-[3.5rem_1fr_auto] gap-3`,
      title: 'text-sm font-medium w-full truncate text-white',
      img: 'h-10 w-10 rounded object-cover',
      author: 'text-xs text-gray-400 truncate'
    }
  }
  else {
    return {
      wrapper: `grid-cols-[3.5rem_1fr_auto] gap-4`,
      title: 'text-base font-medium truncate text-white',
      img: 'h-12 w-12 rounded object-cover',
      author: 'text-sm text-gray-400 truncate'
    }
  }
})

async function handleClick() {
  if (!checkPages) {
    store.startPlay(props.song)
    return
  }
  // 计算分P数据
  try {
    const res = await invokeBiliApi(BLBL.GET_VIDEO_INFO, {
      bvid: props.song.bvid,
    })
    const item = res.data

    if (item.pages && item.pages.length > 1 && props.song) {
      PLstore.openCollection = true
      PLstore.collectionInfo = {
        ...props.song,
        pages: item.pages,
      }
    }
    else {
      store.startPlay(props.song)
    }
  } catch (error) {
    console.error('Failed to check video info:', error)
    store.startPlay(props.song)
  }
}

function addToLater() {
  const isInLater = PLstore.listenLater.some(i => i.id === props.song.id)
  if (isInLater) {
    Message.show({
      type: 'error',
      message: '已存在',
    })
    return
  }
  PLstore.addToListenLater(props.song)
  Message.show({
    type: 'info',
    message: '已添加到稍后再听',
  })
}

function handleSingerDetail(singerMid) {
  if (!singerMid)
    return
  PLstore.currentSinger = singerMid
  router.push('/singerDetail')
}
</script>

<template>
  <div 
    :class="cn('song-item h-16 px-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors group', styleBySize.wrapper, props.class)" 
    @click="handleClick"
  >
    <div class="relative">
      <img :src="cover" :class="styleBySize.img">
      <div v-if="isPlaying" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
         <div class="i-svg-spinners:bars-scale w-4 h-4 text-[#1db954]" />
      </div>
    </div>
    
    <div class="flex flex-col overflow-hidden justify-center h-full">
      <div :class="styleBySize.title" v-html="title" />
      <div class="flex items-center gap-2 mt-0.5">
        <span v-if="pages" class="bg-[#282828] text-[10px] px-1 rounded text-gray-300">合集</span>
        <span 
          :class="styleBySize.author" 
          class="hover:text-white hover:underline"
          @click.stop="handleSingerDetail(mid)"
        >
          {{ author }}
        </span>
      </div>
    </div>

    <!-- 操作 -->
    <div class="flex items-center gap-4 text-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
      <div v-if="later" class="i-mingcute:time-line hover:text-white" title="稍后播放" @click.stop="addToLater" />
      <div v-if="star" class="i-mingcute:heart-line hover:text-white" title="收藏" @click.stop="PLstore.startAddSong(props.song)" />
      <div v-if="del" class="i-mingcute:delete-2-line hover:text-red-500" title="删除" @click.stop="emit('delete-song', props.song)" />
    </div>
  </div>
</template>

<style scoped>
.song-item {
  display: grid;
  align-items: center;
}
</style>
