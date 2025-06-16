<template>
  <div class="fishing-report-detail">
    <div class="header">
      <h1 class="page-title">조황정보 상세</h1>
      <button class="back-button" @click="$router.push('/partner/market-info')">목록으로</button>
    </div>

    <div v-if="report" class="detail-card">
      <div class="report-header">
        <h2>{{ report.title }}</h2>
        <p class="report-date">조항 날짜: {{ formatDate(report.fishingAt) }}</p>
        <p class="report-meta">낚시 상품: {{ report.prodName ? report.prodName : '정보 없음' }} / 작성자: {{ report.user ? report.user.uname : '정보 없음' }}</p>
      </div>

      <img :src="report.thumbnailUrl" alt="썸네일" class="report-thumbnail" />

      <div class="report-content">
        <p>{{ report.content }}</p>
      </div>
 ㅋㅋ
      <div class="report-actions">
        <button @click="toggleEditForm()" class="btn-edit">
          {{ editingReport ? '닫기' : '수정' }}
        </button>
        <button @click="deleteReport(report.frId)" class="btn-delete">삭제</button>
      </div>

      <div v-if="editingReport" class="edit-form-container">
        <form @submit.prevent="updateReport(report.frId)" enctype="multipart/form-data" class="edit-report-form">
          <label>제목:<br/>
              <input type="text" v-model="editForm.title" required />
          </label><br/><br/>
          <label>조황 날짜:<br/>
              <input type="date" v-model="editForm.fishingAt" required />
          </label><br/><br/>
          <label>내용:<br/>
              <textarea v-model="editForm.content" rows="8" required></textarea>
          </label><br/><br/>
          <label>썸네일 이미지 업로드:<br/>
              <input type="file" @change="onEditFileChange" accept="image/*" />
          </label><br/>
          <img :src="editThumbnailPreview || report.thumbnailUrl" alt="썸네일 미리보기" class="preview-thumbnail" /><br/><br/>
          <button type="submit">수정 완료</button>
        </form>
      </div>
    </div>

    <div v-else class="loading">
      조황정보를 불러오는 중입니다...
    </div>
  </div>
</template>

<script>
import { partnerService } from '@/api/partner';

export default {
  name: 'FishingReportDetail',
  data() {
    return {
      report: null,
      loading: true,
      error: null,
      editingReport: false,
      editForm: {
        title: '',
        fishingAt: '',
        content: '',
      },
      editThumbnailFile: null,
      editThumbnailPreview: null,
    };
  },
  created() {
    this.fetchReportDetail();
  },
  methods: {
    async fetchReportDetail() {
      try {
        this.loading = true;
        const response = await partnerService.getFishingReportDetail(this.$route.params.id);
        console.log("API 응답 데이터:", response.data);
        this.report = response.data;
        this.editForm = {
          title: this.report.title,
          fishingAt: this.formatDateForInput(this.report.fishingAt),
          content: this.report.content,
        };
      } catch (error) {
        console.error('Error fetching report detail:', error);
        this.error = '조황정보를 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    getThumbnailUrl(filename) {
      return partnerService.getThumbnailUrl(filename);
    },
    toggleEditForm() {
      this.editingReport = !this.editingReport;
      if (this.editingReport) {
        this.editForm = {
          title: this.report.title,
          fishingAt: this.formatDateForInput(this.report.fishingAt),
          content: this.report.content,
        };
        this.editThumbnailFile = null;
        this.editThumbnailPreview = null;
      }
    },
    onEditFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.editThumbnailFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.editThumbnailPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.editThumbnailFile = null;
        this.editThumbnailPreview = null;
      }
    },
    async updateReport(frId) {
      if (!confirm('정말 수정하시겠습니까?')) return;

      try {
        const rawDate = this.editForm.fishingAt;
        const fishingAtWithTime = rawDate ? rawDate + "T00:00:00" : null;

        const dto = {
          title: this.editForm.title,
          fishingAt: fishingAtWithTime,
          content: this.editForm.content,
        };

        const formData = new FormData();
        formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

        if (this.editThumbnailFile) {
          formData.append("thumbnailFile", this.editThumbnailFile);
        }

        await partnerService.updateFishingReport(frId, formData);
        alert('조황정보가 성공적으로 수정되었습니다.');
        this.editingReport = false;
        this.editThumbnailFile = null;
        this.editThumbnailPreview = null;
        await this.fetchReportDetail();
      } catch (error) {
        console.error('조황정보 수정 실패:', error);
        alert('조황정보 수정에 실패했습니다.');
      }
    },
    async deleteReport(frId) {
      if (!confirm('정말 삭제하시겠습니까?')) return;

      try {
        await partnerService.deleteFishingReport(frId);
        alert('조황정보가 성공적으로 삭제되었습니다.');
        this.$router.push('/partner/market-info');
      } catch (error) {
        console.error('조황정보 삭제 실패:', error);
        alert('조황정보 삭제에 실패했습니다.');
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const d = new Date(dateString);
      const yyyy = d.getFullYear();
      let mm = d.getMonth() + 1;
      let dd = d.getDate();
      if (mm < 10) mm = '0' + mm;
      if (dd < 10) dd = '0' + dd;
      return `${yyyy}-${mm}-${dd}`;
    },
  },
}
</script>

<style scoped>
.fishing-report-detail {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-title {
  margin: 0;
  color: #1a237e;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.back-button {
  padding: 10px 20px;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #555;
  transform: translateY(-2px);
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  border: 1px solid #e0e0e0;
}

.report-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.report-header h2 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.report-header .report-date {
  color: #666;
  font-size: 0.95rem;
}

.report-header .report-meta {
  color: #666;
  font-size: 0.95rem;
}

.report-thumbnail {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid #e0e0e0;
  display: block; /* Ensure it takes full width */
}

.report-content {
  color: #444;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.report-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-edit, .btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-edit {
  background-color: #4CAF50;
  color: white;
}

.btn-edit:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-delete:hover {
  background-color: #da190b;
  transform: translateY(-2px);
}

.edit-form-container {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #e0e0e0;
}

.edit-report-form label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-weight: 500;
  font-size: 1.1rem;
}

.edit-report-form input[type="text"],
.edit-report-form input[type="date"],
.edit-report-form textarea {
  width: calc(100% - 22px);
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.edit-report-form input[type="text"]:focus,
.edit-report-form input[type="date"]:focus,
.edit-report-form textarea:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.edit-report-form textarea {
  resize: vertical;
}

.preview-thumbnail {
  margin-top: 15px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  padding: 8px;
  border-radius: 8px;
  max-width: 200px;
  height: auto;
}

.edit-report-form button[type="submit"] {
  padding: 12px 25px;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.edit-report-form button[type="submit"]:hover {
  background-color: #283593;
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 80px;
  color: #666;
  font-size: 1.3rem;
  background: #ffffff;
  border-radius: 10px;
  border: 1px dashed #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-top: 30px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fishing-report-detail {
    padding: 20px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .page-title {
    font-size: 2rem;
  }

  .report-header h2 {
    font-size: 1.5rem;
  }

  .report-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-edit, .btn-delete {
    width: 100%;
    padding: 10px;
    font-size: 0.9rem;
  }

  .edit-report-form input[type="text"],
  .edit-report-form input[type="date"],
  .edit-report-form textarea {
    width: calc(100% - 16px);
    padding: 8px;
  }

  .edit-report-form button[type="submit"] {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style> 