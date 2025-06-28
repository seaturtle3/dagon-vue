<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js'
import DiaryListView from './components/DiaryListView.vue'

const router = useRouter()
const store = useFishingDiaryStore()

onMounted(async () => {
  await store.fetchDiaries(store.page, store.size)
})

const goToCreateDiary = () => {
  router.push('/fishing-diary/create')
}

const onPageChange = async (page) => {
  await store.fetchDiaries(page, store.size)
}
</script>

<template>
  <div class="center">
    <div class="page-header">
      <h2 class="page-title">✍️ 조행기</h2>
      <button @click="goToCreateDiary" class="create-btn">
        ✏️ 조행기 등록
      </button>
    </div>

    <DiaryListView
      v-if="store.diaries.length"
      :diaries="store.diaries"
      :page="store.page"
      :totalPages="store.totalPages"
      :onPageChange="onPageChange"
    />
    <div v-else class="loading-message">
      <p>조행기를 불러오는 중입니다...</p>
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