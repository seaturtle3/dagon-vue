<template>
  <div class="partner-detail">
    <div class="detail-header">
      <h2>파트너 신청 상세 정보</h2>
      <button class="close-btn" @click="$emit('close')">닫기</button>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="detail-content">
      <div class="detail-section">
        <h3>기본 정보</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>신청번호</label>
            <span>{{ application.pid }}</span>
          </div>
          <div class="info-item">
            <label>신청자</label>
            <span>{{ application.uname }}</span>
          </div>
          <div class="info-item">
            <label>파트너명</label>
            <span>{{ application.pname }}</span>
          </div>
          <div class="info-item">
            <label>사업자등록번호</label>
            <span>{{ application.license }}</span>
          </div>
          <div class="info-item">
            <label>대표자명</label>
            <span>{{ application.ceoName }}</span>
          </div>
          <div class="info-item">
            <label>주소</label>
            <span>{{ application.paddress }}</span>
          </div>
          <div class="info-item">
            <label>상태</label>
            <span :class="['status', application.pstatus]">{{ application.pstatus }}</span>
          </div>
          <div class="info-item">
            <label>신청일</label>
            <span>{{ application.paReviewedAt ? new Date(application.paReviewedAt).toLocaleDateString() : '-' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>추가 정보</h3>
        <div class="info-grid">
          <div class="info-item full-width">
            <label>파트너 정보</label>
            <p>{{ application.pinfo }}</p>
          </div>
          <div v-if="application.paRejectionReason" class="info-item full-width">
            <label>반려 사유</label>
            <p class="rejection-reason">{{ application.paRejectionReason }}</p>
          </div>
        </div>
      </div>

      <div v-if="application.pstatus === '대기' || application.pstatus === '심사중'" class="action-buttons">
        <button class="approve-btn" @click="handleApprove">승인</button>
        <button class="reject-btn" @click="showRejectModal = true">반려</button>
      </div>
    </div>

    <!-- 반려 모달 -->
    <div v-if="showRejectModal" class="modal">
      <div class="modal-content">
        <h3>반려 사유 입력</h3>
        <textarea
          v-model="rejectReason"
          placeholder="반려 사유를 입력해주세요"
          rows="4"
        ></textarea>
        <div class="modal-buttons">
          <button @click="handleReject" :disabled="!rejectReason">반려</button>
          <button @click="showRejectModal = false">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { partnerApplicationApi } from '@/api/admin';

export default {
  name: 'PartnerApplicationDetail',
  props: {
    pid: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      application: null,
      loading: true,
      error: null,
      showRejectModal: false,
      rejectReason: ''
    };
  },
  methods: {
    async fetchApplicationDetail() {
      this.loading = true;
      this.error = null;
      try {
        const response = await partnerApplicationApi.getApplicationDetail(this.pid);
        this.application = response.data;
      } catch (error) {
        this.error = '상세 정보를 불러오는데 실패했습니다.';
        console.error('Error fetching application details:', error);
      } finally {
        this.loading = false;
      }
    },

    async handleApprove() {
      if (!confirm('정말로 이 파트너 신청을 승인하시겠습니까?')) {
        return;
      }

      try {
        await partnerApplicationApi.approveApplication(this.pid);
        alert('파트너 신청이 승인되었습니다.');
        this.$emit('approved');
        this.$emit('close');
      } catch (error) {
        alert('파트너 신청 승인에 실패했습니다.');
        console.error('Error approving application:', error);
      }
    },

    async handleReject() {
      if (!this.rejectReason.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
      }

      try {
        await partnerApplicationApi.rejectApplication(this.pid, this.rejectReason);
        alert('파트너 신청이 반려되었습니다.');
        this.$emit('rejected');
        this.$emit('close');
      } catch (error) {
        alert('파트너 신청 반려에 실패했습니다.');
        console.error('Error rejecting application:', error);
      }
    }
  },
  created() {
    this.fetchApplicationDetail();
  }
};
</script>

<style scoped>
.partner-detail {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.close-btn {
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #1976ed;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #666;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.status.대기 {
  background: #fff3cd;
  color: #856404;
}

.status.승인 {
  background: #d4edda;
  color: #155724;
}

.status.반려 {
  background: #f8d7da;
  color: #721c24;
}

.status.심사중 {
  background: #cce5ff;
  color: #004085;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.approve-btn, .reject-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.approve-btn {
  background: #28a745;
  color: white;
}

.reject-btn {
  background: #dc3545;
  color: white;
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-content h3 {
  margin-bottom: 1rem;
}

.modal-content textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  resize: vertical;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background: #dc3545;
  color: white;
}

.modal-buttons button:last-child {
  background: #6c757d;
  color: white;
}

.modal-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rejection-reason {
  color: #dc3545;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
}
</style> 