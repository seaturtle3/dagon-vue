<template>
  <div class="fishing-report-manager">
    <div class="header">
      <h2 class="page-title">조황정보 관리</h2>
      <div class="header-actions">
        <button @click="goToAddReport" class="btn btn-primary">
          <i class="fas fa-plus"></i> 조황정보 등록
        </button>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="제목으로 검색..."
            @keyup.enter="applyFilters"
          >
          <button @click="applyFilters" class="search-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="reports-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>낚시 날짜</th>
            <th>상품명</th>
            <th>등록일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center">
              <div class="loading-spinner"></div>
              로딩 중...
            </td>
          </tr>
          <tr v-else-if="reports.length === 0">
            <td colspan="6" class="text-center">조회된 조황정보가 없습니다.</td>
          </tr>
          <tr v-for="report in reports" :key="report.frId">
            <td>{{ report.frId }}</td>
            <td class="title-cell" @click="goToDetail(report.frId)">
                <span class="title">{{ report.title }}</span>
                <span v-if="report.thumbnailUrl" class="has-image" title="이미지 있음">
                  <i class="fas fa-image"></i>
                </span>
            </td>
            <td>{{ formatDate(report.fishingAt) }}</td>
            <td>{{ report.prodName || '-' }}</td>
            <td>{{ formatDateTime(report.createdAt) }}</td>
            <td class="actions">
              <button @click.stop="editReport(report.frId)" class="btn btn-edit">수정</button>
              <button @click.stop="confirmDelete(report.frId)" class="btn btn-delete">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination-container" v-if="totalPages > 1">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          이전
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          다음
        </button>
      </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { partnerService } from '@/api/partner.js';
import { getCurrentUser } from '@/api/user.js';
import BoardSearchBox from '@/components/common/BoardSearchBox.vue';
import BoardPagination from '@/components/common/BoardPagination.vue';

const router = useRouter();
const reports = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const searchType = ref('title');
const searchKeyword = ref('');
const partnerId = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchReports = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await partnerService.getFishingReports(
      currentPage.value - 1,
      10,
      searchType.value,
      searchKeyword.value
    );
    reports.value = response.data.content || [];
    totalPages.value = response.data.totalPages || 1;
  } catch (err) {
    console.error('조황 정보를 불러오는 중 오류가 발생했습니다.', err);
    error.value = '조황 정보를 불러오는 데 실패했습니다.';
    reports.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCurrentUser = async () => {
  try {
    const response = await getCurrentUser();
    partnerId.value = response.data.uno;
  } catch (err) {
    console.error('현재 사용자 정보를 가져오는 중 오류가 발생했습니다.', err);
    error.value = '사용자 정보를 가져오는 데 실패했습니다.';
  }
};

const handleSearch = (search) => {
  currentPage.value = 1;
  searchType.value = search.type;
  searchKeyword.value = search.keyword;
  fetchReports();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchReports();
};

const goToAddReport = () => {
  console.log("새 조황정보 추가 페이지로 이동");
};

const goToDetail = (reportId) => {
  if (reportId) {
    console.log(`상세 보기 페이지로 이동: ${reportId}`);
  }
};

const editReport = (reportId) => {
    // 수정 페이지로 이동하는 로직
    console.log(`수정 페이지로 이동: ${reportId}`);
};

const confirmDelete = async (reportId) => {
  if (confirm('정말로 이 조황정보를 삭제하시겠습니까?')) {
    try {
      await partnerService.deleteFishingReport(reportId);
      alert('조황정보가 삭제되었습니다.');
      // 현재 페이지의 아이템이 모두 삭제되었을 경우, 이전 페이지로 이동
      if (reports.value.length === 1 && currentPage.value > 1) {
        currentPage.value--;
      }
      await fetchReports();
    } catch (err) {
      console.error('조황정보 삭제 실패:', err);
      alert('조황정보 삭제에 실패했습니다.');
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchReports();
  fetchCurrentUser();
});

watch([() => searchType.value, () => searchKeyword.value], () => {
    // 검색어가 변경되면 첫 페이지부터 다시 검색
    if (currentPage.value !== 1) {
        currentPage.value = 1;
    }
    fetchReports();
});

</script>

<style scoped>
.fishing-report-manager {
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 600;
}
.header-actions {
  display: flex;
  gap: 1rem;
}
.search-box {
  display: flex;
}
.search-box input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}
.search-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-left: none;
  background-color: #f0f0f0;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
}
.table-container {
  overflow-x: auto;
}
.reports-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.reports-table th, .reports-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}
.reports-table th {
  background-color: #f5f7fa;
  font-weight: 500;
}
.title-cell {
  cursor: pointer;
  text-align: left;
}
.title-cell:hover .title {
  text-decoration: underline;
}
.has-image {
  margin-left: 0.5rem;
  color: #3498db;
}
.actions .btn {
  padding: 0.3rem 0.6rem;
  margin: 0 0.2rem;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn-edit {
  background-color: #3498db;
  color: white;
}
.btn-delete {
  background-color: #e74c3c;
  color: white;
}
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}
.page-btn {
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
}
.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.page-info {
  margin: 0 1rem;
}
.loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 2rem auto;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.text-center {
    text-align: center;
}
</style> 