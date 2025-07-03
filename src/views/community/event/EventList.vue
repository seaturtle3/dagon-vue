<script setup>
import EventCard from "@/views/community/event/components/EventCard.vue";
import BoardPagination from "@/components/common/BoardPagination.vue";
import BoardSearchBox from "@/components/common/BoardSearchBox.vue";
import BoardWriteButton from "@/components/common/BoardWriteButton.vue"

import {ref, onMounted, watch} from 'vue'
import {fetchEvents} from '@/api/event.js'

const events = ref([])
const loading = ref(true)
const totalPages = ref(0)

const search = ref({
  keyword: '',
  type: 'title'
})

const status = ref('')
const page = ref(0)
const size = ref(12)

const fetchEventList = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: size.value,
      keyword: search.value.keyword,
      type: search.value.type,
      status: status.value
    }

    // 빈 값 제거
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const res = await fetchEvents(params)
    
    // Spring Boot 페이징 응답 구조에 맞게 처리
    if (res.data && res.data.content) {
      events.value = res.data.content
      totalPages.value = res.data.totalPages
      page.value = res.data.number
    } else if (Array.isArray(res.data)) {
      events.value = res.data
      totalPages.value = 1
      page.value = 0
    } else {
      events.value = []
      totalPages.value = 1
      page.value = 0
    }
  } catch (err) {
    console.error('이벤트 목록 불러오기 실패:', err)
    events.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

onMounted(fetchEventList)

watch(
    [page, status, () => search.value.keyword, () => search.value.type],
    fetchEventList
)

const handleSearch = () => {
  page.value = 0
  fetchEventList()
}

const handleStatusChange = (newStatus) => {
  status.value = newStatus
  page.value = 0
}
</script>

<template>
  <div class="event-list center">
    <h2 class="center-title">이벤트</h2>

    <!-- 🔍 검색박스 -->
    <BoardSearchBox v-model:search="search" @search="handleSearch" />

    <!-- 📌 상태 필터 탭 -->
    <div class="mb-3 d-flex gap-2 justify-content-center">
      <button :class="{ active: status === '' }" @click="handleStatusChange('')">전체</button>
      <button :class="{ active: status === 'SCHEDULED' }" @click="handleStatusChange('SCHEDULED')">진행예정</button>
      <button :class="{ active: status === 'ONGOING' }" @click="handleStatusChange('ONGOING')">진행중</button>
      <button :class="{ active: status === 'COMPLETED' }" @click="handleStatusChange('COMPLETED')">종료</button>
    </div>

    <!-- 📄 카드 리스트 -->
    <div class="list-body">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>이벤트를 불러오는 중...</p>
      </div>
      <div v-else-if="events.length === 0" class="empty-state">
        <i class="fas fa-calendar-alt"></i>
        <p>등록된 이벤트가 없습니다.</p>
      </div>
      <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
        <div class="col" v-for="event in events.slice(0, 12)" :key="event.eventId">
          <EventCard :event="event"/>
        </div>
      </div>
    </div>

    <BoardWriteButton to="/event/write" label="이벤트 작성"/>
    <!-- 📌 페이지네이션 -->
    <BoardPagination :page="page" :totalPages="totalPages" @change="page = $event"/>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  text-align: center;
}

.center-title {
 
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  padding: 0.5em 2em;
}

button {
  border: none;
  background-color: #eee;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

button.active {
  background-color: #333;
  color: white;
}

.list-body {
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}
</style>