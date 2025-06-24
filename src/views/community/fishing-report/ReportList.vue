<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useFishingReportStore } from '@/store/fishing-center/useFishingReportStore.js'
import ReportListView from "@/views/community/fishing-report/components/ReportListView.vue";

const router = useRouter()
const store = useFishingReportStore()

const handleScroll = () => {
  const scrollY = window.scrollY || window.pageYOffset
  const viewportHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight

  if (
    scrollY + viewportHeight + 100 >= fullHeight &&
    !store.loading &&
    store.currentPage + 1 < store.totalPages
  ) {
    store.fetchReports(store.currentPage + 1, store.pageSize)
  }
}

onMounted(async () => {
  if (store.reports.length === 0) {
    await store.fetchReports(0, store.pageSize)
  }
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const goToCreateReport = () => {
  router.push('/fishing-report/create')
}
</script>

<template>
  <div class="center">
    <div class="page-header">
      <h2 class="page-title">🎣 조황정보</h2>
      <button @click="goToCreateReport" class="create-btn">
        ✏️ 조황정보 등록
      </button>
    </div>

    <ReportListView v-if="store.reports.length" :reports="store.reports" />
    <div v-else class="loading-message">
      <p>조황 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e3f2fd;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
}

.loading-message {
  text-align: center;
  padding: 50px;
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .create-btn {
    width: 100%;
  }
}
</style>
