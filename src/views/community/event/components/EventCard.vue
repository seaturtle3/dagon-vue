<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BASE_URL } from '@/constants/baseUrl'
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL
const fallbackImage = `${baseUrl}/thumbnail/default-event-thumbnail.png`

const goToDetail = () => {
  router.push(`/event/${props.event.eventId}`)
}

const statusClass = computed(() => {
  return {
    '진행예정': 'scheduled',
    '진행중': 'ongoing',
    '종료': 'ended'
  }[props.event.eventStatus] || ''
})

function formatDate(str) {
  if (!str || str.trim() === '' || str === 'null' || str === 'undefined') return '미정'
  try {
    const [y, m, d] = str.split('-')
    if (!y || !m || !d) return '미정'
    return `${y}. ${m}. ${d}`
  } catch (error) {
    console.error('날짜 형식 오류:', error)
    return '미정'
  }
}

const formattedPeriod = computed(() => {
  const { startAt, endAt } = props.event
  const start = formatDate(startAt)
  const end = formatDate(endAt)
  if (start === '미정' && end === '미정') return '상시 진행'
  return `${start} ~ ${end}`
})
</script>

<template>
  <div class="event-card" @click="goToDetail">
    <div class="thumbnail-wrapper">
      <img :src="`${BASE_URL}${event.thumbnailUrl}` || fallbackImage" alt="이벤트 썸네일" />
      <div v-if="event.isTop" class="badge badge-top">TOP</div>
      <div class="badge badge-status" :class="statusClass">{{ event.eventStatus }}</div>
    </div>
    <div class="event-body">
      <h5 class="title">{{ event.title }}</h5>
      <p class="period">{{ formattedPeriod }}</p>
    </div>
  </div>
</template>

<style scoped>
.event-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: box-shadow 0.2s;
}

.event-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail-wrapper {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.thumbnail-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 4px;
  color: #fff;
}

.badge-top {
  top: 8px;
  left: 8px;
  background-color: #ff5050;
}

.badge-status {
  top: 8px;
  right: 8px;
}

.badge-status.scheduled {
  background-color: #007bff;
}

.badge-status.ongoing {
  background-color: #28a745;
}

.badge-status.ended {
  background-color: #999;
}

.event-body {
  padding: 12px;
  flex-grow: 1;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.period {
  font-size: 0.85rem;
  color: #666;
}
</style>