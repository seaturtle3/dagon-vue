<script setup>
import BoardPagination from "@/components/common/BoardPagination.vue";
import BoardSearchBox from "@/components/common/BoardSearchBox.vue";
import BoardWriteButton from "@/components/common/BoardWriteButton.vue";
import {ref, onMounted} from 'vue'
import {fetchNotices} from '@/api/noticeApi'
import {computed} from "vue";
import {useRoute, useRouter} from 'vue-router'

const topNotices = computed(() => notices.value.filter(n => n.isTop))
const normalNotices = computed(() => notices.value.filter(n => !n.isTop))

const notices = ref([])

const totalPages = ref(0)
const size = 10

const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 0)  // ⬅ URL에서 page 읽기

// 상태 묶기
const search = ref({
  type: 'title+content',
  keyword: ''
})

const onSearch = () => {
  loadNotices(0)  // 페이지 0으로 초기화하면서 검색
}


const loadNotices = async (targetPage = 0) => {
  page.value = targetPage

  // URL 에 query 반영
  await router.push({
    path: `/notice`,
    query: {
      page: page.value,
      keyword: search.value.keyword,
      type: search.value.type
    }
  })

  const params = {
    page: page.value,
    size: size,
    type: search.value.type
  }

  // 🔽 keyword 가 비어있지 않은 경우에만 포함
  const trimmed = search.value.keyword?.trim()
  if (trimmed) {
    params.keyword = trimmed
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
    <BoardSearchBox v-model:search="search" @search="onSearch" />

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

    <!-- 글쓰기버튼(관리자)-->
    <BoardWriteButton to="/notice/write" label="공지 작성" />

    <!-- 페이징 -->
    <BoardPagination :page="page" :totalPages="totalPages" @change="loadNotices" />
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  text-align: center;
}

.btn-custom {
  background-color: #333;
  color: #fff;
  padding: 6px 12px;
  border: 1px solid #333;
  border-radius: 4px;
  cursor: pointer;
}
.btn-custom:hover {
  background-color: #111;
}
</style>