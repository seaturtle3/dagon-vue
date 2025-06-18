<script setup>
import BoardPagination from "@/components/common/BoardPagination.vue";
import BoardSearchBox from "@/components/common/BoardSearchBox.vue";
import BoardWriteButton from "@/components/common/BoardWriteButton.vue";
import BoardListItem from "@/components/common/BoardListItem.vue";

import {ref, onMounted, computed} from 'vue'
import {fetchNotices} from '@/api/noticeApi'
import {useRoute, useRouter} from 'vue-router'


const notices = ref([])
const totalPages = ref(0)
const size = 10

const route = useRoute()
const router = useRouter()
const page = ref(Number(route.query.page) || 0)  // ⬅ URL에서 page 읽기

const topNotices = computed(() => notices.value.filter(n => n.isTop))
const normalNotices = computed(() => notices.value.filter(n => !n.isTop))


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
  router.push(`/notice/${id}`)
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
    <h2 class="center">공지사항</h2>

    <!-- 검색 (선택) -->
    <BoardSearchBox v-model:search="search" @search="onSearch"/>

    <!-- 공지사항 목록 -->

    <div class="list-header row fw-semibold border-top border-bottom py-2 bg-light">
      <div class="col-2 text-center">번호</div>
      <div class="col text-start">제목</div>
      <div class="col-3 text-center">작성일</div>
    </div>

    <div class="list-body">
      <!-- 📌 상단 고정 공지 -->
      <BoardListItem
          v-for="notice in topNotices"
          :key="'top-' + notice.noticeId"
          :number="'공지'"
          :title="notice.title"
          :date="formatDate(notice.createdAt)"
          @click="() => goToDetail(notice.noticeId)"
      />

      <!-- 일반 공지 -->
      <BoardListItem
          v-for="(notice, index) in normalNotices"
          :key="'normal-' + notice.noticeId"
          :number="page * size + index + 1"
          :title="notice.title"
          :date="formatDate(notice.createdAt)"
          @click="() => goToDetail(notice.noticeId)"
      />
    </div>

    <!-- 글쓰기버튼(관리자)-->
    <BoardWriteButton to="/notice/write" label="공지 작성"/>

    <!-- 페이징 -->
    <BoardPagination :page="page" :totalPages="totalPages" @change="loadNotices"/>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  text-align: center;
}

.list-header {
  /* Bootstrap row 구조 적용됐으므로 display, padding 등 최소화 */
  border-top: 2px solid #dee2e6;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
}

.list-body {
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 20px;
}
</style>