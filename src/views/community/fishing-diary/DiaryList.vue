<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js'
import { useUserStore } from '@/store/inquiries/userStore.js'
import Pagination from "@/components/common-function/Pagination.vue";
import DiaryCard from "@/views/community/fishing-diary/components/DiaryCard.vue";

const router = useRouter()
const store = useFishingDiaryStore()
const userStore = useUserStore()

function getResponsivePageSize() {
  const width = window.innerWidth
  if (width > 1200) return 16   // 4x4
  if (width > 900) return 8     // 2x4
  if (width > 480) return 4     // 1x4
  return 2                      // 모바일 최소
}

const updatePageSize = async () => {
  const newSize = getResponsivePageSize()
  if (store.size !== newSize) {
    store.size = newSize
    await store.fetchDiaries(0, store.size)
  }
}

onMounted(async () => {
  await updatePageSize()
  window.addEventListener('resize', updatePageSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePageSize)
})

const goToCreateDiary = () => {
  router.push('/fishing-diary/create')
}

const onPageChange = async (page) => {
  await store.fetchDiaries(page, store.size)
}
</script>

<template>
  <div class="container diary-container mx-auto">
    <section class="section-block">
      <div class="page-header">
        <h2 class="page-title">조행기</h2>
        <div class="header-actions">
          <button @click="router.push('/fishing-report')" class="go-btn">조황정보 바로가기</button>
          <button v-if="userStore.role === 'PARTNER'" @click="goToCreateDiary" class="create-btn">✏️ 조행기 등록</button>
        </div>
      </div>

      <div v-if="store.diaries.length" class="diary-grid">
        <DiaryCard
            v-for="diary in store.diaries"
            :key="diary.id || diary.fdId"
            :diary="diary"
        />
      </div>

      <div v-else class="loading-message">
        <p>조행기를 불러오는 중입니다...</p>
      </div>

      <Pagination
          :page="store.page"
          :totalPages="store.totalPages"
          :zeroBased="true"
          @page-change="onPageChange"
      />
    </section>
  </div>
</template>

<style scoped>
.diary-container {
  padding: 32px 0 48px 0;
  max-width: 1200px;
}

.section-block {
  margin-top: 60px;
  margin-bottom: 120px;
}

.diary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 32px;
  margin-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 0;
  border-bottom: 2px solid #e5e7eb;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.go-btn {
  background: #fff;
  color: #2563eb;
  border: 1px solid #d1d5db;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.go-btn:hover {
  background: #fff;
  border-color: #2563eb;
}

.create-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.loading-message {
  text-align: center;
  padding: 80px 0;
  color: #6b7280;
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .diary-container {
    padding: 16px 0 24px 0;
  }
  
  .section-block {
    margin-bottom: 24px;
  }
  
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
    max-width: 300px;
  }
  
  .diary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .diary-grid {
    grid-template-columns: 1fr;
  }
}

/* 페이징 버튼 - 동그란 스타일, 사이트 메인 컬러 적용 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}
.pagination button {
  background: transparent;
  color: #222;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination button.active,
.pagination button:focus {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}
.pagination button:hover:not(.active):not(:disabled) {
  background: #f3f4f6;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination .arrow-btn {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #2563eb;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: border-color 0.18s;
}
.pagination .arrow-btn:hover:not(:disabled) {
  border-color: #2563eb;
}
</style>