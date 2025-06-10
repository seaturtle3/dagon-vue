<template>
  <div class="partners">
    <h1>파트너 관리</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="파트너명 또는 사업자번호로 검색">
      <button @click="searchPartners">검색</button>
    </div>
    
    <table class="partners-table">
      <thead>
        <tr>
          <th>파트너번호</th>
          <th>파트너명</th>
          <th>사업자번호</th>
          <th>대표자명</th>
          <th>연락처</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="partner in partners" :key="partner.id">
          <td>{{ partner.id }}</td>
          <td>{{ partner.name }}</td>
          <td>{{ partner.businessNumber }}</td>
          <td>{{ partner.ownerName }}</td>
          <td>{{ partner.phone }}</td>
          <td>{{ partner.status }}</td>
          <td>
            <button @click="viewPartnerDetails(partner.id)">상세</button>
            <button @click="togglePartnerStatus(partner.id)">{{ partner.status === '활성' ? '비활성' : '활성' }}</button>
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
  name: 'Partners',
  data() {
    return {
      searchQuery: '',
      partners: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    }
  },
  methods: {
    async searchPartners() {
      // TODO: API 호출하여 파트너 검색
      this.partners = [
        {
          id: 'P001',
          name: '바다낚시터',
          businessNumber: '123-45-67890',
          ownerName: '김철수',
          phone: '010-1234-5678',
          status: '활성'
        },
        // 더 많은 파트너 데이터...
      ]
    },
    viewPartnerDetails(partnerId) {
      // TODO: 파트너 상세 정보 보기
    },
    async togglePartnerStatus(partnerId) {
      // TODO: 파트너 상태 변경 API 호출
    },
    changePage(page) {
      this.currentPage = page
      this.searchPartners()
    }
  },
  created() {
    this.searchPartners()
  }
}
</script>

<style scoped>
.partners {
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

.partners-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.partners-table th,
.partners-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.partners-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.partners-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.partners-table button:first-child {
  background-color: #3498db;
  color: white;
}

.partners-table button:last-child {
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