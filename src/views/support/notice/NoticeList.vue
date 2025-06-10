<script setup>
import {ref, onMounted} from 'vue'
import {fetchNotices} from '@/api/noticeApi'
import {computed} from "vue";
import {useRoute, useRouter} from 'vue-router'

const topNotices = computed(() => notices.value.filter(n => n.isTop))
const normalNotices = computed(() => notices.value.filter(n => !n.isTop))

const notices = ref([])
// const page = ref(0)
const totalPages = ref(0)
const size = 10
const keyword = ref('')

const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 0)  // ⬅ URL에서 page 읽기

const searchType = ref('title+content')


const loadNotices = async (targetPage = 0) => {
  page.value = targetPage

  // URL 에 query 반영
  router.push({
    path: `/notice`,
    query: { page: page.value, keyword: keyword.value, type: searchType.value }})

  const params = {
    page: page.value,
    size: size,
    type: searchType.value
  }
  // 🔽 keyword 가 비어있지 않은 경우에만 포함
  if (keyword.value && keyword.value.trim() !== '') {
    params.keyword = keyword.value.trim()
  }

  try {
    const res = await fetchNotices(params)
    notices.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (error) {
    console.log("공지사항 목록 로드 실패:", error)
  }
}

const goToDetail = (id) => {
  window.location.href = `/support/notice/${id}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadNotices(page.value)
})
</script>

<template>
  <div class="notice-list center">
    <h2>공지사항</h2>

    <!-- 검색 (선택) -->
    <div class="search-box">
      <select v-model="searchType">
        <option value="title">제목</option>
        <option value="content">내용</option>
        <option value="title+content">제목+내용</option>
      </select>
      <input v-model="keyword" placeholder="검색어 입력"/>
      <button @click="loadNotices(0)">검색</button>
    </div>

    <!-- 공지사항 목록 -->
    <table>
      <thead>
      <tr>
        <th>번호</th>
        <th>제목</th>
        <th>작성일</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="notice in topNotices" :key="'top-' + notice.id" @click="goToDetail(notice.id)">
        <td>공지</td>
        <td>{{ notice.title }}</td>
        <td>{{ formatDate(notice.createdAt) }}</td>
      </tr>
      <tr v-for="(notice, index) in normalNotices" :key="'normal-'+ notice.id" @click="goToDetail(notice.id)">
        <td>{{ page * size + index + 1 }}</td>
        <td>{{ notice.title }}</td>
        <td>{{ formatDate(notice.createdAt) }}</td>
      </tr>
      </tbody>
    </table>

    <!-- 페이징 -->
    <div class="pagination">
      <button :disabled="page === 0" @click="loadNotices(page - 1)">이전</button>
      <span>{{ page + 1 }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages - 1" @click="loadNotices(page + 1)">다음</button>
    </div>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  text-align: center;
}
</style>