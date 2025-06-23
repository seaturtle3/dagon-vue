<template>
  <div class="fishing-diaries-admin">
    <div class="header">
      <h2>조행기 관리</h2>
      <div class="header-actions">
        <div class="page-size-selector">
          <label for="pageSize">페이지 크기:</label>
          <select id="pageSize" v-model="itemsPerPage" @change="onPageSizeChange">
            <option value="10">10개</option>
            <option value="20">20개</option>
            <option value="50">50개</option>
            <option value="100">100개</option>
          </select>
        </div>
        <div class="search-box">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="제목 또는 작성자로 검색..."
              @input="handleSearch"
          >
          <button @click="handleSearch" class="search-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ totalDiaries }}</div>
          <div class="stat-label">전체 조행기</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ todayDiaries }}</div>
          <div class="stat-label">오늘 등록</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ thisWeekDiaries }}</div>
          <div class="stat-label">이번 주 등록</div>
        </div>
      </div>

      <div class="table-container">
        <table class="diaries-table">
          <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="diary in paginatedDiaries" :key="diary.fdId">
            <td>{{ diary.fdId }}</td>
            <td class="title-cell">
              <div class="title-content">
                <span class="title">{{ diary.title }}</span>
                <span v-if="diary.thumbnailUrl" class="has-image">
                    <i class="fas fa-image"></i>
                  </span>
              </div>
            </td>
            <td>{{ diary.user?.nickname || '알 수 없음' }}</td>
            <td>{{ formatDateTime(diary.fishingAt) }}</td>
            <td class="actions">
              <button @click="viewDiary(diary.fdId)" class="btn-view">
                <i class="fas fa-eye"></i> 보기
              </button>
              <button @click="deleteDiary(diary.fdId)" class="btn-delete">
                <i class="fas fa-trash"></i> 삭제
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> 로딩 중...
        </div>

        <div v-if="!loading && (!Array.isArray(diaries) || diaries.length === 0)" class="no-data">
          조행기가 없습니다.
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination-info">
          총 {{ totalElements }}개의 조행기 중 {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalElements) }}번째
        </div>
        <div class="pagination">
          <button
              @click="changePage(1)"
              :disabled="currentPage === 1"
              class="page-btn"
              title="첫 페이지"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>

          <button
              @click="changePage(currentPage - 1)"
              :disabled="!hasPrevious"
              class="page-btn"
              title="이전 페이지"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>

          <button
              @click="changePage(currentPage + 1)"
              :disabled="!hasNext"
              class="page-btn"
              title="다음 페이지"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <button
              @click="changePage(totalPages)"
              :disabled="currentPage === totalPages"
              class="page-btn"
              title="마지막 페이지"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <h3>조행기 삭제</h3>
        <p>정말로 이 조행기를 삭제하시겠습니까?</p>
        <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn-delete">삭제</button>
          <button @click="closeDeleteModal" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/lib/axios';
import { useDebounceFn } from '@vueuse/core';

const router = useRouter();

const diaries = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showDeleteModal = ref(false);
const diaryToDelete = ref(null);

const totalPages = ref(1);
const totalElements = ref(0);
const hasNext = ref(false);
const hasPrevious = ref(false);

const totalDiaries = ref(0);
const todayDiaries = ref(0);
const thisWeekDiaries = ref(0);

const fetchDiaries = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value - 1,
      size: itemsPerPage.value,
      sort: 'createdAt,desc',
    };
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    const response = await axios.get('/api/fishing-diary/get-all', { params });
    const data = response.data;
    diaries.value = data.content;
    totalPages.value = data.totalPages;
    totalElements.value = data.totalElements;
    hasNext.value = data.hasNext;
    hasPrevious.value = data.hasPrevious;
  } catch (error) {
    console.error('Error fetching diaries:', error);
    diaries.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/fishing-diary/admin/stats');
    const stats = response.data;
    totalDiaries.value = stats.totalCount;
    todayDiaries.value = stats.todayCount;
    thisWeekDiaries.value = stats.thisWeekCount;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

onMounted(() => {
  fetchDiaries();
  fetchStats();
});

const paginatedDiaries = computed(() => diaries.value);

const visiblePages = computed(() => {
  const pages = [];
  let startPage = Math.max(1, currentPage.value - 2);
  let endPage = Math.min(totalPages.value, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchDiaries();
};

const onPageSizeChange = () => {
  currentPage.value = 1;
  fetchDiaries();
};

const debouncedFetch = useDebounceFn(() => {
  currentPage.value = 1;
  fetchDiaries();
}, 300);

const handleSearch = () => {
  debouncedFetch();
};

watch(searchQuery, handleSearch);

const viewDiary = (id) => {
  router.push(`/admin/fishing-diaries/${id}`);
};

const deleteDiary = (id) => {
  diaryToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (diaryToDelete.value) {
    try {
      await axios.delete(`/api/fishing-diary/delete/${diaryToDelete.value}`);
      closeDeleteModal();
      fetchDiaries();
      fetchStats();
    } catch (error) {
      console.error('Error deleting diary:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  diaryToDelete.value = null;
};

const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
/* Scoped styles from FishingReports.vue, can be adjusted if needed */
.fishing-diaries-admin {
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.page-size-selector, .search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector label {
  font-size: 0.9rem;
  color: #555;
}

#pageSize {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-box input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 250px;
}

.search-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #2980b9;
}

.content {
  margin-top: 1.5rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: #ecf0f1;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.diaries-table {
  width: 100%;
  border-collapse: collapse;
}

.diaries-table th, .diaries-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.diaries-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.title-cell .title-content {
  display: flex;
  align-items: center;
}

.title-cell .title {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.title-cell .title:hover {
  text-decoration: underline;
}

.has-image {
  margin-left: 0.5rem;
  color: #3498db;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-edit, .btn-delete, .btn-cancel {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.3s;
}

.btn-view, .btn-edit {
  background-color: #3498db;
  color: white;
}
.btn-delete {
  background-color: #e74c3c;
  color: white;
}
.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-view:hover, .btn-edit:hover, .btn-delete:hover, .btn-cancel:hover {
  opacity: 0.85;
}

.btn-view i, .btn-edit i, .btn-delete i {
  margin-right: 0.3rem;
}

.loading, .no-data {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.9rem;
  color: #555;
}

.pagination {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  background-color: #fff;
  border: 1px solid #ccc;
  color: #333;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.page-btn:not(:disabled):hover {
  background-color: #f0f0f0;
}

.page-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.modal-content p {
  margin: 1rem 0;
  color: #555;
}

.modal-content .warning {
  color: #e74c3c;
  font-weight: 600;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style> 