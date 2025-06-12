<template>
  <div class="partner-applications">
    <h1>파트너 신청 목록</h1>
    
    <div class="search-bar">
      <select v-model="searchType" @change="handleSearchTypeChange(searchType)">
        <option value="pname">파트너명</option>
        <option value="license">사업자등록번호</option>
      </select>
      <input type="text" v-model="searchQuery" placeholder="검색어를 입력하세요">
      <select v-model="status" @change="handleStatusChange(status)">
        <option value="">전체</option>
        <option value="대기">대기</option>
        <option value="승인">승인</option>
        <option value="반려">반려</option>
      </select>
      <button @click="searchApplications">검색</button>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="applications-table">
        <thead>
          <tr>
            <th>신청번호</th>
            <th>신청자</th>
            <th>파트너명</th>
            <th>사업자등록번호</th>
            <th>대표자명</th>
            <th>주소</th>
            <th>상태</th>
            <th>신청일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="application in applications" :key="application.pid">
            <td>{{ application.pid }}</td>
            <td>{{ application.uname }}</td>
            <td>{{ application.pname }}</td>
            <td>{{ application.license }}</td>
            <td>{{ application.ceoName }}</td>
            <td>{{ application.paddress }}</td>
            <td>{{ application.pstatus }}</td>
            <td>{{ application.createdAt ? new Date(application.createdAt).toLocaleDateString() : '-' }}</td>
            <td>
              <button @click="showDetail(application.pid)">상세</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
      </div>
    </div>

    <!-- 상세보기 모달 -->
    <div v-if="showDetailModal" class="modal">
      <PartnerApplicationDetail
        :pid="selectedPid"
        @close="closeDetail"
        @approved="handleApproved"
        @rejected="handleRejected"
      />
    </div>
  </div>
</template>

<script>
import { partnerApplicationApi } from '@/api/admin.js';
import PartnerApplicationDetail from './PartnerApplicationDetail.vue';

export default {
  name: 'PartnerApplications',
  components: {
    PartnerApplicationDetail
  },
  data() {
    return {
      searchQuery: '',
      applications: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      searchType: 'pname',
      status: '',
      loading: false,
      error: null,
      showDetailModal: false,
      selectedPid: null
    }
  },
  methods: {
    async searchApplications() {
      this.loading = true;
      this.error = null;
      try {
        const response = await partnerApplicationApi.getApplications(
          this.currentPage - 1,
          this.itemsPerPage,
          this.searchQuery,
          this.searchType,
          this.status
        );
        
        this.applications = response.data.content;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        this.error = '파트너 신청 목록을 불러오는데 실패했습니다.';
        console.error('Error fetching applications:', error);
      } finally {
        this.loading = false;
      }
    },

    showDetail(pid) {
      this.selectedPid = pid;
      this.showDetailModal = true;
    },

    closeDetail() {
      this.showDetailModal = false;
      this.selectedPid = null;
    },

    handleApproved() {
      this.searchApplications();
    },

    handleRejected() {
      this.searchApplications();
    },

    changePage(page) {
      this.currentPage = page;
      this.searchApplications();
    },

    handleSearchTypeChange(type) {
      this.searchType = type;
      this.searchApplications();
    },

    handleStatusChange(status) {
      this.status = status;
      this.searchApplications();
    }
  },
  created() {
    this.searchApplications();
  }
}
</script>

<style scoped>
.partner-applications {
  padding: 1rem;
}

.search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.applications-table th,
.applications-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.applications-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.applications-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.applications-table button:first-child {
  background-color: #3498db;
  color: white;
}

.applications-table button:nth-child(2) {
  background-color: #2ecc71;
  color: white;
}

.applications-table button:last-child {
  background-color: #e74c3c;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.search-bar select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style> 