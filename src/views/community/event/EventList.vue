<script setup>
import {ref, onMounted, watch} from 'vue'
import axios from 'axios'
import EventCard from "@/views/community/event/components/EventCard.vue";
import BoardPagination from "@/components/common/BoardPagination.vue";
import BoardSearchBox from "@/components/common/BoardSearchBox.vue";
import BoardWriteButton from "@/components/common/BoardWriteButton.vue"

const events = ref([])
const loading = ref(true)
const totalPages = ref(0)

const search = ref({
  keyword: '',
  type: 'title'
})

const status = ref('')
const page = ref(0)
const size = ref(9)

const fetchEvents = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/event', {
      params: {
        page: page.value,
        size: size.value,
        keyword: search.value.keyword,
        type: search.value.type,
        status: status.value
      }
    })
    events.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.error('이벤트 목록 불러오기 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)

watch(
    [page, status, () => search.value.keyword, () => search.value.type],
    fetchEvents
)

const handleSearch = () => {
  page.value = 0
  fetchEvents()
}

const handleStatusChange = (newStatus) => {
  status.value = newStatus
  page.value = 0
}
</script>

<template>
  <div class="center">
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
      <div v-if="loading">로딩 중...</div>
      <div v-else-if="events.length === 0">이벤트가 없습니다.</div>
      <div v-else class="row row-cols-1 row-cols-md-3 g-3">
        <div class="col" v-for="event in events" :key="event.eventId">
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
  text-align: center;
  margin-bottom: 1.5rem;
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
</style>