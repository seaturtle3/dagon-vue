<template>
  <div class="partner-applications">
    <h1>파트너 신청 목록</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="파트너명 또는 사업자번호로 검색">
      <button @click="searchApplications">검색</button>
    </div>
    
    <table class="applications-table">
      <thead>
        <tr>
          <th>신청번호</th>
          <th>파트너명</th>
          <th>사업자번호</th>
          <th>대표자명</th>
          <th>연락처</th>
          <th>신청일</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="application in applications" :key="application.id">
          <td>{{ application.id }}</td>
          <td>{{ application.name }}</td>
          <td>{{ application.businessNumber }}</td>
          <td>{{ application.ownerName }}</td>
          <td>{{ application.phone }}</td>
          <td>{{ application.applyDate }}</td>
          <td>{{ application.status }}</td>
          <td>
            <button @click="viewApplicationDetails(application.id)">상세</button>
            <button v-if="application.status === '대기'" @click="approveApplication(application.id)">승인</button>
            <button v-if="application.status === '대기'" @click="rejectApplication(application.id)">거절</button>
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
</template>

<script>
export default {
  name: 'PartnerApplications',
  data() {
    return {
      searchQuery: '',
      applications: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    }
  },
  methods: {
    async searchApplications() {
      // TODO: API 호출하여 신청 목록 검색
      this.applications = [
        {
          id: 'A001',
          name: '바다낚시터',
          businessNumber: '123-45-67890',
          ownerName: '김철수',
          phone: '010-1234-5678',
          applyDate: '2024-03-20',
          status: '대기'
        },
        // 더 많은 신청 데이터...
      ]
    },
    viewApplicationDetails(applicationId) {
      // TODO: 신청 상세 정보 보기
    },
    async approveApplication(applicationId) {
      // TODO: 신청 승인 API 호출
    },
    async rejectApplication(applicationId) {
      // TODO: 신청 거절 API 호출
    },
    changePage(page) {
      this.currentPage = page
      this.searchApplications()
    }
  },
  created() {
    this.searchApplications()
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
</style> 