<template>
  <div class="reservations">
    <h1>예약 목록</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="예약번호, 회원명, 파트너명으로 검색">
      <input type="date" v-model="dateFilter">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="예약대기">예약대기</option>
        <option value="예약확정">예약확정</option>
        <option value="예약취소">예약취소</option>
        <option value="이용완료">이용완료</option>
      </select>
      <button @click="searchReservations">검색</button>
    </div>
    
    <table class="reservations-table">
      <thead>
        <tr>
          <th>예약번호</th>
          <th>회원명</th>
          <th>파트너명</th>
          <th>예약일</th>
          <th>인원</th>
          <th>금액</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reservation in reservations" :key="reservation.id">
          <td>{{ reservation.id }}</td>
          <td>{{ reservation.memberName }}</td>
          <td>{{ reservation.partnerName }}</td>
          <td>{{ reservation.date }}</td>
          <td>{{ reservation.people }}</td>
          <td>{{ reservation.amount.toLocaleString() }}원</td>
          <td>{{ reservation.status }}</td>
          <td>
            <button @click="viewReservationDetails(reservation.id)">상세</button>
            <button v-if="reservation.status === '예약대기'" @click="approveReservation(reservation.id)">승인</button>
            <button v-if="reservation.status === '예약대기'" @click="rejectReservation(reservation.id)">거절</button>
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
  name: 'Reservations',
  data() {
    return {
      searchQuery: '',
      dateFilter: '',
      statusFilter: '',
      reservations: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    }
  },
  methods: {
    async searchReservations() {
      // TODO: API 호출하여 예약 목록 검색
      this.reservations = [
        {
          id: 'R001',
          memberName: '홍길동',
          partnerName: '바다낚시터',
          date: '2024-03-20',
          people: 4,
          amount: 200000,
          status: '예약대기'
        },
        // 더 많은 예약 데이터...
      ]
    },
    viewReservationDetails(reservationId) {
      // TODO: 예약 상세 정보 보기
    },
    async approveReservation(reservationId) {
      // TODO: 예약 승인 API 호출
    },
    async rejectReservation(reservationId) {
      // TODO: 예약 거절 API 호출
    },
    changePage(page) {
      this.currentPage = page
      this.searchReservations()
    }
  },
  created() {
    this.searchReservations()
  }
}
</script>

<style scoped>
.reservations {
  padding: 1rem;
}

.search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.search-bar input,
.search-bar select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar input[type="text"] {
  flex: 1;
}

.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.reservations-table th,
.reservations-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.reservations-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.reservations-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reservations-table button:first-child {
  background-color: #3498db;
  color: white;
}

.reservations-table button:nth-child(2) {
  background-color: #2ecc71;
  color: white;
}

.reservations-table button:last-child {
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