<script setup>
import { onMounted, computed, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFishingReportStore } from "@/store/fishing-center/useFishingReportStore.js"
import ReportDetailItem from "@/views/community/fishing-report/components/ReportDetailItem.vue";

const store = useFishingReportStore()
const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.frId)

const currentUser = ref(null)

onMounted(() => {
  // localStorage에서 로그인 정보 불러오기
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    currentUser.value = JSON.parse(userInfo)
  }
})

onMounted(async () => {
  await store.fetchReports()
  await store.fetchReportById(id.value)
})

// id가 바뀔 때마다 상세정보 다시 불러오기
watch(() => id.value, async (newId) => {
  await store.fetchReportById(newId)
})

// 이전/다음 글 인덱스 계산
const currentIndex = computed(() => store.reports.findIndex(r => r.frId == id.value))
const prevReport = computed(() => store.reports[currentIndex.value - 1] || null)
const nextReport = computed(() => store.reports[currentIndex.value + 1] || null)

function goToReport(frId) {
  router.push(`/fishing-report/${frId}`)
}

// 키보드 ←/→로 이전/다음글 이동
function onKeydown(e) {
  if (e.key === 'ArrowLeft' && prevReport.value) {
    goToReport(prevReport.value.frId)
  } else if (e.key === 'ArrowRight' && nextReport.value) {
    goToReport(nextReport.value.frId)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

</script>

<template>
  <div class="center" >
    <div class="nav-row" v-if="store.reports.length">
      <button v-if="prevReport" class="nav-btn" @click="goToReport(prevReport.frId)">&lt; 이전글</button>
      <button v-if="nextReport" class="nav-btn" @click="goToReport(nextReport.frId)">다음글 &gt;</button>
    </div>
    <ReportDetailItem :report="store.currentReport" :current-user="currentUser" v-if="store.currentReport"/>
    <p v-else>조황 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
.nav-row {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
  gap: 24px;
}
.nav-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-btn:hover {
  background: #1565c0;
}
</style>