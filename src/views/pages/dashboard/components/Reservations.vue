<template>
  <div class="reservations">
    <h1>예약 목록</h1>
    <div class="reservation-tabs">
      <button :class="{active: activeTab==='member'}" @click="changeTab('member')">회원 예약 목록</button>
    </div>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="예약번호, 회원명, 파트너명으로 검색">
      <input type="date" v-model="dateFilter">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="PENDING">예약대기</option>
        <option value="PAID">예약확정</option>
        <option value="CANCELED">예약취소</option>
      </select>
      <button @click="searchReservations">검색</button>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 예약 목록을 불러오는 중...
    </div>
    
    <table v-if="!loading && activeTab==='member'" class="reservations-table">
      <thead>
        <tr>
          <th>예약번호</th>
          <th>회원명</th>
          <th>상품명</th>
          <th>예약일</th>
          <th>인원</th>
          <th>금액</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reservation in memberReservations" :key="reservation.reservationId">
          <td>{{ reservation.reservationId }}</td>
          <td>{{ reservation.userName }}</td>
          <td>{{ reservation.productName }}</td>
          <td>{{ formatDate(reservation.fishingAt) }}</td>
          <td>{{ reservation.numPerson }}명</td>
          <td>{{ formatPrice(reservation.amount || reservation.totalPrice) }}원</td>
          <td>
            <span :class="['status-badge', getStatusClass(reservation.reservationStatus)]">
              {{ getStatusText(reservation.reservationStatus) }}
            </span>
          </td>
          <td>
            <button @click="viewReservationDetails(reservation.reservationId)">상세</button>
            <button v-if="reservation.reservationStatus === 'PENDING'" @click="approveReservation(reservation.reservationId)">승인</button>
            <button v-if="reservation.reservationStatus === 'PENDING'" @click="rejectReservation(reservation.reservationId)">거절</button>
          </td>
        </tr>
      </tbody>
    </table>

    <table v-if="!loading && activeTab==='guest'" class="reservations-table">
      <thead>
        <tr>
          <th>예약번호</th>
          <th>예약자명</th>
          <th>이메일</th>
          <th>연락처</th>
          <th>상품명</th>
          <th>예약일</th>
          <th>인원</th>
          <th>금액</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reservation in guestReservations" :key="reservation.reservationId">
          <td>{{ reservation.reservationId }}</td>
          <td>{{ reservation.userName }}</td>
          <td>{{ reservation.userEmail || 'N/A' }}</td>
          <td>{{ reservation.userPhone || 'N/A' }}</td>
          <td>{{ reservation.productName }}</td>
          <td>{{ formatDate(reservation.fishingAt) }}</td>
          <td>{{ reservation.numPerson }}명</td>
          <td>{{ formatPrice(reservation.amount || reservation.totalPrice) }}원</td>
          <td>
            <span :class="['status-badge', getStatusClass(reservation.reservationStatus)]">
              {{ getStatusText(reservation.reservationStatus) }}
            </span>
          </td>
          <td>
            <button @click="viewReservationDetails(reservation.reservationId)">상세</button>
            <button v-if="reservation.reservationStatus === 'PENDING'" @click="approveReservation(reservation.reservationId)">승인</button>
            <button v-if="reservation.reservationStatus === 'PENDING'" @click="rejectReservation(reservation.reservationId)">거절</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="!loading && (!allReservations || allReservations.length === 0)" class="no-data">
      <i class="fas fa-inbox"></i>
      <p>예약 내역이 없습니다.</p>
    </div>
    
    <div v-if="!loading && allReservations && allReservations.length > 0 && 
         ((activeTab === 'member' && memberReservations.length === 0) || 
          (activeTab === 'guest' && guestReservations.length === 0))" class="no-data">
      <i class="fas fa-inbox"></i>
      <p>{{ activeTab === 'member' ? '회원' : '비회원' }} 예약 내역이 없습니다.</p>
    </div>
    
    <div v-if="!loading && allReservations && allReservations.length > 0" class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        <i class="fas fa-chevron-left"></i> 이전
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <span class="total-info">
        총 {{ totalItems }}개 예약 
        ({{ activeTab === 'member' ? memberReservations.length : guestReservations.length }}개 표시)
      </span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        다음 <i class="fas fa-chevron-right"></i>
      </button>
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
                <span>{{ selectedReservation.reservationId }}</span>
              </div>
              <div class="detail-item">
                <label>예약일:</label>
                <span>{{ formatDate(selectedReservation.fishingAt) }}</span>
              </div>
              <div class="detail-item">
                <label>상태:</label>
                <span class="status-badge" :class="getStatusClass(selectedReservation.reservationStatus)">
                  {{ getStatusText(selectedReservation.reservationStatus) }}
                </span>
              </div>
              <div class="detail-item">
                <label>인원:</label>
                <span>{{ selectedReservation.numPerson }}명</span>
              </div>
              <div class="detail-item">
                <label>금액:</label>
                <span>{{ formatPrice(selectedReservation.amount || selectedReservation.totalPrice) }}원</span>
              </div>
              <div class="detail-item">
                <label>결제방법:</label>
                <span>{{ selectedReservation.paymentsMethod || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>예약자 정보</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>예약자명:</label>
                <span>{{ selectedReservation.userName }}</span>
              </div>
              <div class="detail-item">
                <label>연락처:</label>
                <span>{{ selectedReservation.phone || selectedReservation.userPhone || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>이메일:</label>
                <span>{{ selectedReservation.email || selectedReservation.userEmail || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>상품 정보</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>상품명:</label>
                <span>{{ selectedReservation.productName }}</span>
              </div>
              <div class="detail-item">
                <label>옵션명:</label>
                <span>{{ selectedReservation.optionName || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>옵션 수량:</label>
                <span>{{ selectedReservation.optionQuantity || 0 }}개</span>
              </div>
              <div class="detail-item">
                <label>예약일시:</label>
                <span>{{ formatDateTime(selectedReservation.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>예약 관리</h3>
            <div class="action-buttons">
              <button
                v-if="selectedReservation.reservationStatus === 'PENDING'"
                class="btn-approve"
                @click="approveReservation(selectedReservation.reservationId)"
              >
                예약 승인
              </button>
              <button
                v-if="selectedReservation.reservationStatus === 'PENDING'"
                class="btn-reject"
                @click="rejectReservation(selectedReservation.reservationId)"
              >
                예약 거절
              </button>
              <button
                v-if="selectedReservation.reservationStatus === 'PAID'"
                class="btn-complete"
                @click="completeReservation(selectedReservation.reservationId)"
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
import { reservationApi } from '@/api/admin.js';

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
      totalItems: 0,
      itemsPerPage: 10,
      showDetailModal: false,
      selectedReservation: null,
      activeTab: 'member',
      loading: false,
    }
  },
  computed: {
    memberReservations() {
      if (!this.allReservations || !Array.isArray(this.allReservations)) {
        return [];
      }
      // userId가 있으면 회원 예약
      return this.allReservations.filter(reservation => 
        reservation && reservation.userId && reservation.userId !== null
      );
    },
    guestReservations() {
      if (!this.allReservations || !Array.isArray(this.allReservations)) {
        return [];
      }
      // userId가 없으면 비회원 예약
      return this.allReservations.filter(reservation => 
        reservation && (!reservation.userId || reservation.userId === null)
      );
    }
  },
  methods: {
    async searchReservations() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage - 1, // 백엔드는 0부터 시작
          size: this.itemsPerPage,
          search: this.searchQuery || '',
          date: this.dateFilter || '',
          status: this.statusFilter || ''
        };

        let response;
        
        // 탭에 따라 다른 API 호출 (현재는 모두 같은 API 사용)
        if (this.activeTab === 'member') {
          console.log('회원 예약 목록 조회');
          response = await reservationApi.getMemberReservations(params);
        } else {
          console.log('비회원 예약 목록 조회');
          response = await reservationApi.getGuestReservations(params);
        }
        
        console.log('예약 목록 API 응답:', response);
        
        if (response && response.data) {
          if (response.data.content && Array.isArray(response.data.content)) {
            this.allReservations = response.data.content;
            this.totalItems = response.data.totalElements || 0;
            this.totalPages = response.data.totalPages || 1;
          } else if (Array.isArray(response.data)) {
            this.allReservations = response.data;
            this.totalItems = response.data.length;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          } else {
            this.allReservations = [];
            this.totalItems = 0;
            this.totalPages = 1;
          }
        } else {
          this.allReservations = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }

        // 현재 페이지가 총 페이지 수를 초과하면 마지막 페이지로 설정
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
      } catch (error) {
        console.error('예약 목록 조회 실패:', error);
        alert('예약 목록을 불러오는데 실패했습니다.');
        this.allReservations = [];
        this.totalItems = 0;
        this.totalPages = 1;
      } finally {
        this.loading = false;
      }
    },

    async viewReservationDetails(reservationId) {
      try {
        const response = await reservationApi.getReservationDetail(reservationId);
        console.log('예약 상세 조회 응답:', response);
        
        if (response.data && response.data.reservation) {
          this.selectedReservation = response.data.reservation;
        } else if (response.data) {
          this.selectedReservation = response.data;
        } else {
          this.selectedReservation = null;
        }
        
        this.showDetailModal = true;
      } catch (error) {
        console.error('예약 상세 조회 실패:', error);
        alert('예약 상세 정보를 불러오는데 실패했습니다.');
      }
    },

    async approveReservation(reservationId) {
      try {
        await reservationApi.approveReservation(reservationId);
        alert('예약이 승인되었습니다.');
        
        // 해당 예약의 상태를 업데이트
        const reservation = this.allReservations.find(r => r.reservationId === reservationId);
        if (reservation) {
          reservation.reservationStatus = 'PAID';
        }

        this.closeDetailModal();
        this.searchReservations(); // 목록 새로고침
      } catch (error) {
        console.error('예약 승인 실패:', error);
        alert('예약 승인에 실패했습니다.');
      }
    },

    async rejectReservation(reservationId) {
      try {
        await reservationApi.rejectReservation(reservationId);
        alert('예약이 거절되었습니다.');
        
        // 해당 예약의 상태를 업데이트
        const reservation = this.allReservations.find(r => r.reservationId === reservationId);
        if (reservation) {
          reservation.reservationStatus = 'CANCELED';
        }

        this.closeDetailModal();
        this.searchReservations(); // 목록 새로고침
      } catch (error) {
        console.error('예약 거절 실패:', error);
        alert('예약 거절에 실패했습니다.');
      }
    },

    async completeReservation(reservationId) {
      try {
        await reservationApi.completeReservation(reservationId);
        alert('이용완료 처리가 완료되었습니다.');
        
        // 해당 예약의 상태를 업데이트
        const reservation = this.allReservations.find(r => r.reservationId === reservationId);
        if (reservation) {
          reservation.reservationStatus = 'COMPLETED';
        }

        this.closeDetailModal();
        this.searchReservations(); // 목록 새로고침
      } catch (error) {
        console.error('이용완료 처리 실패:', error);
        alert('이용완료 처리에 실패했습니다.');
      }
    },

    changePage(page) {
      if (page >= 1 && page <= (this.totalPages || 1)) {
        this.currentPage = page;
        this.searchReservations();
      }
    },

    changeTab(tab) {
      this.activeTab = tab;
      this.currentPage = 1;
      this.searchQuery = '';
      this.dateFilter = '';
      this.statusFilter = '';
      // 탭 변경 시 데이터 다시 로드
      this.searchReservations();
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedReservation = null;
    },

    getStatusClass(status) {
      if (!status) return 'status-pending';
      const statusMap = {
        'PENDING': 'status-pending',
        'PAID': 'status-confirmed',
        'CANCELED': 'status-cancelled',
        'COMPLETED': 'status-completed'
      };
      return statusMap[status] || 'status-pending';
    },

    getStatusText(status) {
      if (!status) return '상태없음';
      const statusMap = {
        'PENDING': '예약대기',
        'PAID': '예약확정',
        'CANCELED': '예약취소',
        'COMPLETED': '이용완료'
      };
      return statusMap[status] || status;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        console.error('날짜 포맷 오류:', error);
        return 'N/A';
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('날짜시간 포맷 오류:', error);
        return 'N/A';
      }
    },

    formatPrice(price) {
      if (!price && price !== 0) return '0';
      try {
        const numPrice = Number(price);
        if (isNaN(numPrice)) return '0';
        return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } catch (error) {
        console.error('가격 포맷 오류:', error);
        return '0';
      }
    }
  },
  created() {
    this.searchReservations();
  }
}
</script>

<style scoped>
.reservations {
  padding: 1rem;
}

.reservation-tabs {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.reservation-tabs button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reservation-tabs button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.reservation-tabs button:hover:not(.active) {
  background-color: #e9ecef;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.loading i {
  margin-right: 0.5rem;
  color: #3498db;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-data i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
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

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-completed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
}

.total-info {
  color: #666;
  font-size: 0.9rem;
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
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
  padding: 1rem 0;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  margin-bottom: 0.25rem;
}

.detail-item span {
  color: #333;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-approve,
.btn-reject,
.btn-complete,
.btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
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
  background-color: #95a5a6;
  color: white;
}



@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .reservations-table {
    font-size: 0.9rem;
  }
  
  .reservations-table th,
  .reservations-table td {
    padding: 0.5rem;
  }
}
</style>