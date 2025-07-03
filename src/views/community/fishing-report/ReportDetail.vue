<script setup>
import { onMounted, computed, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFishingReportStore } from "@/store/fishing-center/useFishingReportStore.js"
import ReportDetailItem from "@/views/community/fishing-report/components/ReportDetailItem.vue";
import api from '@/lib/axios.js' // axios 인스턴스

const store = useFishingReportStore()
const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.frId)

const currentUser = ref(null)
const loading = ref(false)
const error = ref(null)

const prevReport = ref(null)
const nextReport = ref(null)

async function fetchPrevNext() {
  try {
    const res = await api.get(`/api/fishing-report/${id.value}/prev-next`)
    prevReport.value = res.data.prev
    nextReport.value = res.data.next
  } catch (e) {
    prevReport.value = null
    nextReport.value = null
  }
}

onMounted(() => {
  // localStorage에서 로그인 정보 불러오기
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    currentUser.value = JSON.parse(userInfo)
  }
})

onMounted(async () => {
  await loadReportData()
})

// id가 바뀔 때마다 상세정보/이전다음 다시 불러오기
watch(() => id.value, async (newId) => {
  await loadReportData()
})

async function loadReportData() {
  loading.value = true
  error.value = null
  
  try {
    await store.fetchReportById(id.value)
    await fetchPrevNext()
  } catch (e) {
    console.error('조황정보 로드 실패:', e)
    error.value = e.response?.data?.message || '조황정보를 불러올 수 없습니다.'
    
    // 조황정보를 찾을 수 없는 경우 리스트로 이동
    if (e.response?.status === 500 && e.response?.data?.message?.includes('찾을 수 없습니다')) {
      setTimeout(() => {
        alert('해당 조황정보가 존재하지 않습니다. 목록으로 이동합니다.')
        router.push('/fishing-report')
      }, 1000)
    }
  } finally {
    loading.value = false
  }
}

function goToReport(frId) {
  router.push(`/fishing-report/${frId}`)
}

function goToList() {
  router.push('/fishing-report')
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
    <div class="nav-row">
      <button v-if="prevReport" class="nav-btn" @click="goToReport(prevReport.frId)">&lt; 이전글</button>
      <button class="nav-btn" @click="goToList">목록보기</button>
      <button v-if="nextReport" class="nav-btn" @click="goToReport(nextReport.frId)">다음글 &gt;</button>
    </div>
    <ReportDetailItem :report="store.currentReport" :current-user="currentUser" v-if="store.currentReport"/>
    <div v-else-if="loading" class="loading-message">
      <p>조황 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="goToList" class="btn-back">목록으로 돌아가기</button>
    </div>
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

.loading-message {
  text-align: center;
  padding: 50px;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 50px;
  color: #d32f2f;
  font-size: 1.1rem;
}

.btn-back {
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #1565c0;
}
</style>