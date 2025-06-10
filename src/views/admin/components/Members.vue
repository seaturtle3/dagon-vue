<template>
  <div class="members">
    <h1>회원 정보 관리</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="회원명 또는 이메일로 검색">
      <button @click="searchMembers">검색</button>
    </div>
    
    <table class="members-table">
      <thead>
        <tr>
          <th>회원번호</th>
          <th>이름</th>
          <th>이메일</th>
          <th>가입일</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id">
          <td>{{ member.id }}</td>
          <td>{{ member.name }}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.joinDate }}</td>
          <td>{{ member.status }}</td>
          <td>
            <button @click="viewMemberDetails(member.id)">상세</button>
            <button @click="toggleMemberStatus(member.id)">{{ member.status === '활성' ? '비활성' : '활성' }}</button>
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
  name: 'Members',
  data() {
    return {
      searchQuery: '',
      members: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    }
  },
  methods: {
    async searchMembers() {
      // TODO: API 호출하여 회원 검색
      this.members = [
        {
          id: 'M001',
          name: '홍길동',
          email: 'hong@example.com',
          joinDate: '2024-01-01',
          status: '활성'
        },
        // 더 많은 회원 데이터...
      ]
    },
    viewMemberDetails(memberId) {
      // TODO: 회원 상세 정보 보기
    },
    async toggleMemberStatus(memberId) {
      // TODO: 회원 상태 변경 API 호출
    },
    changePage(page) {
      this.currentPage = page
      this.searchMembers()
    }
  },
  created() {
    this.searchMembers()
  }
}
</script>

<style scoped>
.members {
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

.members-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.members-table th,
.members-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.members-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.members-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.members-table button:first-child {
  background-color: #3498db;
  color: white;
}

.members-table button:last-child {
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