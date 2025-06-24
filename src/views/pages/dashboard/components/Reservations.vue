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
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <span class="total-info">총 {{ allReservations.length }}개 예약</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 예약 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>예약 상세 정보</h2>
          <button class="close-btn" @click="closeDetailModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedReservation">
          <div class="detail-section">
            <h3>기본 정보</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>예약번호:</label>
                <span>{{ selectedReservation.id }}</span>
              </div>
              <div class="detail-item">
                <label>예약일:</label>
                <span>{{ selectedReservation.date }}</span>
              </div>
              <div class="detail-item">
                <label>상태:</label>
                <span class="status-badge" :class="getStatusClass(selectedReservation.status)">
                  {{ selectedReservation.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>인원:</label>
                <span>{{ selectedReservation.people }}명</span>
              </div>
              <div class="detail-item">
                <label>금액:</label>
                <span>{{ selectedReservation.amount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>회원 정보</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>회원명:</label>
                <span>{{ selectedReservation.memberName }}</span>
              </div>
              <div class="detail-item">
                <label>연락처:</label>
                <span>{{ getMemberPhone(selectedReservation.memberName) }}</span>
              </div>
              <div class="detail-item">
                <label>이메일:</label>
                <span>{{ getMemberEmail(selectedReservation.memberName) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>파트너 정보</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>파트너명:</label>
                <span>{{ selectedReservation.partnerName }}</span>
              </div>
              <div class="detail-item">
                <label>연락처:</label>
                <span>{{ getPartnerPhone(selectedReservation.partnerName) }}</span>
              </div>
              <div class="detail-item">
                <label>주소:</label>
                <span>{{ getPartnerAddress(selectedReservation.partnerName) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>예약 관리</h3>
            <div class="action-buttons">
              <button
                v-if="selectedReservation.status === '예약대기'"
                class="btn-approve"
                @click="approveReservation(selectedReservation.id)"
              >
                예약 승인
              </button>
              <button
                v-if="selectedReservation.status === '예약대기'"
                class="btn-reject"
                @click="rejectReservation(selectedReservation.id)"
              >
                예약 거절
              </button>
              <button
                v-if="selectedReservation.status === '예약확정'"
                class="btn-complete"
                @click="completeReservation(selectedReservation.id)"
              >
                이용완료 처리
              </button>
              <button class="btn-cancel" @click="closeDetailModal">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
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
      allReservations: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showDetailModal: false,
      selectedReservation: null
    }
  },
  computed: {
    reservations() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.allReservations.slice(startIndex, endIndex);
    }
  },
  methods: {
    async searchReservations() {
      // TODO: API 호출하여 예약 목록 검색
      this.allReservations = [
        {
          id: 'R001',
          memberName: '홍길동',
          partnerName: '바다낚시터',
          date: '2024-03-20',
          people: 4,
          amount: 200000,
          status: '예약대기'
        },
        {
          id: 'R002',
          memberName: '김철수',
          partnerName: '강물낚시터',
          date: '2024-03-21',
          people: 2,
          amount: 120000,
          status: '예약확정'
        },
        {
          id: 'R003',
          memberName: '이영희',
          partnerName: '호수낚시터',
          date: '2024-03-22',
          people: 6,
          amount: 300000,
          status: '이용완료'
        },
        {
          id: 'R004',
          memberName: '박민수',
          partnerName: '바다낚시터',
          date: '2024-03-23',
          people: 3,
          amount: 180000,
          status: '예약취소'
        },
        {
          id: 'R005',
          memberName: '정수진',
          partnerName: '강물낚시터',
          date: '2024-03-24',
          people: 5,
          amount: 250000,
          status: '예약대기'
        },
        {
          id: 'R006',
          memberName: '최동욱',
          partnerName: '호수낚시터',
          date: '2024-03-25',
          people: 2,
          amount: 100000,
          status: '예약확정'
        },
        {
          id: 'R007',
          memberName: '윤서연',
          partnerName: '바다낚시터',
          date: '2024-03-26',
          people: 4,
          amount: 220000,
          status: '예약대기'
        },
        {
          id: 'R008',
          memberName: '강현우',
          partnerName: '강물낚시터',
          date: '2024-03-27',
          people: 3,
          amount: 150000,
          status: '이용완료'
        },
        {
          id: 'R009',
          memberName: '임지은',
          partnerName: '호수낚시터',
          date: '2024-03-28',
          people: 7,
          amount: 350000,
          status: '예약확정'
        },
        {
          id: 'R010',
          memberName: '송태호',
          partnerName: '바다낚시터',
          date: '2024-03-29',
          people: 2,
          amount: 110000,
          status: '예약취소'
        },
        {
          id: 'R011',
          memberName: '한미영',
          partnerName: '강물낚시터',
          date: '2024-03-30',
          people: 4,
          amount: 200000,
          status: '예약대기'
        },
        {
          id: 'R012',
          memberName: '조성민',
          partnerName: '호수낚시터',
          date: '2024-04-01',
          people: 5,
          amount: 250000,
          status: '예약확정'
        },
        {
          id: 'R013',
          memberName: '오혜진',
          partnerName: '바다낚시터',
          date: '2024-04-02',
          people: 3,
          amount: 165000,
          status: '이용완료'
        },
        {
          id: 'R014',
          memberName: '류준호',
          partnerName: '강물낚시터',
          date: '2024-04-03',
          people: 6,
          amount: 300000,
          status: '예약대기'
        },
        {
          id: 'R015',
          memberName: '배수아',
          partnerName: '호수낚시터',
          date: '2024-04-04',
          people: 2,
          amount: 100000,
          status: '예약확정'
        },
        {
          id: 'R016',
          memberName: '신동현',
          partnerName: '바다낚시터',
          date: '2024-04-05',
          people: 4,
          amount: 220000,
          status: '예약취소'
        },
        {
          id: 'R017',
          memberName: '권은지',
          partnerName: '강물낚시터',
          date: '2024-04-06',
          people: 3,
          amount: 150000,
          status: '예약대기'
        },
        {
          id: 'R018',
          memberName: '남기준',
          partnerName: '호수낚시터',
          date: '2024-04-07',
          people: 8,
          amount: 400000,
          status: '예약확정'
        },
        {
          id: 'R019',
          memberName: '백소영',
          partnerName: '바다낚시터',
          date: '2024-04-08',
          people: 2,
          amount: 110000,
          status: '이용완료'
        },
        {
          id: 'R020',
          memberName: '전우진',
          partnerName: '강물낚시터',
          date: '2024-04-09',
          people: 5,
          amount: 250000,
          status: '예약대기'
        },
        {
          id: 'R021',
          memberName: '차미라',
          partnerName: '호수낚시터',
          date: '2024-04-10',
          people: 3,
          amount: 150000,
          status: '예약확정'
        },
        {
          id: 'R022',
          memberName: '구태영',
          partnerName: '바다낚시터',
          date: '2024-04-11',
          people: 4,
          amount: 220000,
          status: '예약취소'
        },
        {
          id: 'R023',
          memberName: '문하나',
          partnerName: '강물낚시터',
          date: '2024-04-12',
          people: 6,
          amount: 300000,
          status: '예약대기'
        },
        {
          id: 'R024',
          memberName: '양준석',
          partnerName: '호수낚시터',
          date: '2024-04-13',
          people: 2,
          amount: 100000,
          status: '이용완료'
        },
        {
          id: 'R025',
          memberName: '구본철',
          partnerName: '바다낚시터',
          date: '2024-04-14',
          people: 5,
          amount: 275000,
          status: '예약확정'
        },
        {
          id: 'R026',
          memberName: '안지현',
          partnerName: '강물낚시터',
          date: '2024-04-15',
          people: 3,
          amount: 150000,
          status: '예약대기'
        },
        {
          id: 'R027',
          memberName: '유재석',
          partnerName: '호수낚시터',
          date: '2024-04-16',
          people: 7,
          amount: 350000,
          status: '예약취소'
        },
        {
          id: 'R028',
          memberName: '정다은',
          partnerName: '바다낚시터',
          date: '2024-04-17',
          people: 4,
          amount: 220000,
          status: '예약확정'
        },
        {
          id: 'R029',
          memberName: '최준호',
          partnerName: '강물낚시터',
          date: '2024-04-18',
          people: 2,
          amount: 100000,
          status: '이용완료'
        },
        {
          id: 'R030',
          memberName: '김민지',
          partnerName: '호수낚시터',
          date: '2024-04-19',
          people: 6,
          amount: 300000,
          status: '예약대기'
        }
      ]

      // 총 페이지 수 계산
      this.totalPages = Math.ceil(this.allReservations.length / this.itemsPerPage);
      // 현재 페이지가 총 페이지 수를 초과하면 마지막 페이지로 설정
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    },
    viewReservationDetails(reservationId) {
      // TODO: 예약 상세 정보 보기
      this.selectedReservation = this.allReservations.find(reservation => reservation.id === reservationId);
      this.showDetailModal = true;
    },
    async approveReservation(reservationId) {
      try {
      // TODO: 예약 승인 API 호출
        console.log('예약 승인:', reservationId);

        // 실제 API 호출 시 아래 주석 해제
        // const response = await this.$http.put(`/api/reservations/${reservationId}/approve`);

        // 성공 메시지 표시
        alert('예약이 승인되었습니다.');

        // 해당 예약의 상태를 업데이트
        const reservation = this.allReservations.find(r => r.id === reservationId);
        if (reservation) {
          reservation.status = '예약확정';
        }

        // 모달 닫기
        this.closeDetailModal();

        // 목록 새로고침 (실제 API 사용 시)
        // this.searchReservations();

      } catch (error) {
        console.error('예약 승인 실패:', error);
        alert('예약 승인에 실패했습니다.');
      }
    },
    async rejectReservation(reservationId) {
      try {
      // TODO: 예약 거절 API 호출
        console.log('예약 거절:', reservationId);

        // 실제 API 호출 시 아래 주석 해제
        // const response = await this.$http.put(`/api/reservations/${reservationId}/reject`);

        // 성공 메시지 표시
        alert('예약이 거절되었습니다.');

        // 해당 예약의 상태를 업데이트
        const reservation = this.allReservations.find(r => r.id === reservationId);
        if (reservation) {
          reservation.status = '예약취소';
        }

        // 모달 닫기
        this.closeDetailModal();

        // 목록 새로고침 (실제 API 사용 시)
        // this.searchReservations();

      } catch (error) {
        console.error('예약 거절 실패:', error);
        alert('예약 거절에 실패했습니다.');
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedReservation = null;
    },
    getStatusClass(status) {
      // 상태에 따른 클래스 반환
      return {
        'status-pending': status === '예약대기',
        'status-confirmed': status === '예약확정',
        'status-cancelled': status === '예약취소',
        'status-completed': status === '이용완료'
      };
    },
    getMemberPhone(memberName) {
      // 회원의 연락처 반환
      return '010-1234-5678'; // 실제 구현 시 이 부분을 실제 API 호출로 대체
    },
    getMemberEmail(memberName) {
      // 회원의 이메일 반환
      return 'hong@example.com'; // 실제 구현 시 이 부분을 실제 API 호출로 대체
    },
    getPartnerPhone(partnerName) {
      // 파트너의 연락처 반환
      return '02-1234-5678'; // 실제 구현 시 이 부분을 실제 API 호출로 대체
    },
    getPartnerAddress(partnerName) {
      // 파트너의 주소 반환
      return '서울시 강남구 역삼동'; // 실제 구현 시 이 부분을 실제 API 호출로 대체
    },
    completeReservation(reservationId) {
      // TODO: 이용완료 처리 API 호출
      try {
        console.log('이용완료 처리:', reservationId);

        // 실제 API 호출 시 아래 주석 해제
        // const response = await this.$http.put(`/api/reservations/${reservationId}/complete`);

        // 성공 메시지 표시
        alert('이용완료 처리가 완료되었습니다.');

        // 해당 예약의 상태를 업데이트
        const reservation = this.allReservations.find(r => r.id === reservationId);
        if (reservation) {
          reservation.status = '이용완료';
        }

        // 모달 닫기
        this.closeDetailModal();

        // 목록 새로고침 (실제 API 사용 시)
        // this.searchReservations();

      } catch (error) {
        console.error('이용완료 처리 실패:', error);
        alert('이용완료 처리에 실패했습니다.');
      }
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
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination button:disabled {
  background-color: #f8f9fa;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
  min-width: 60px;
  text-align: center;
}

.total-info {
  color: #666;
  font-size: 0.9rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.detail-grid {
  display: flex;
  gap: 1rem;
}

.detail-item {
  flex: 1;
}

.detail-item label {
  font-weight: 600;
}

.detail-item span {
  margin-left: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.status-pending {
  background-color: #f0f0f0;
}

.status-confirmed {
  background-color: #dff0d8;
}

.status-cancelled {
  background-color: #f2dede;
}

.status-completed {
  background-color: #dff0d8;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-approve,
.btn-reject,
.btn-complete,
.btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-approve {
  background-color: #2ecc71;
  color: white;
}

.btn-reject {
  background-color: #e74c3c;
  color: white;
}

.btn-complete {
  background-color: #3498db;
  color: white;
}

.btn-cancel {
  background-color: #f8f9fa;
  color: #333;
}
</style>