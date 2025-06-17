<template>
  <div class="fishing-report-manager">
    <div class="header">
      <h2 class="page-title">조황정보 관리</h2>
    </div>

    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="조황정보 제목을 입력하세요">
        <button class="search-button" @click="searchReports"><i class="fa-solid fa-eye"></i></button>
      </div>
      
      <div class="filter-options">
        <select v-model="typeFilter" @change="filterReports">
          <option value="all">전체</option>
          <!-- 필요한 경우 조황정보 유형 필터 추가 (예: 바다/민물) -->
        </select>
      </div>
    </div>

    <div class="fishing-report-grid">
      <div v-if="reports.length === 0" class="no-reports-grid">
        등록된 조황정보가 없습니다.
      </div>
      <div v-for="report in filteredReports" :key="report.frId" class="report-card" @click="viewReportDetail(report.frId)">
        <div class="report-image">
          <img :src="getThumbnailUrl(report.thumbnailUrl)" :alt="report.title" @error="handleImageError">
          <span class="date-badge">
            {{ formatDate(report.fishingAt) }}
          </span>
        </div>
        
        <div class="report-info">
          <h3 class="report-title">제목:{{ report.title }}</h3>
          <p class="report-content-preview">내용:{{ report.content.slice(0, 50) }}...</p>
          <div class="product-info">
            <span class="product-label">상품:</span>
            <span class="product-name">{{ report.prodName || '상품 정보 없음' }}</span>
          </div>
          <div class="report-actions">
            <button class="delete-button" @click.stop="deleteReport(report.frId)">삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { partnerService } from '@/api/partner';

export default {
  name: 'FishingReportManager',
  props: {
    prodId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      reports: [],
      loading: true,
      error: null,
      searchQuery: '',
      typeFilter: 'all',
      filteredReports: [],
      selectedStatus: 'ALL'
    };
  },
  watch: {
    searchQuery: 'applyFilters',
    typeFilter: 'applyFilters',
    reports: 'applyFilters'
  },
  methods: {
    getThumbnailUrl(filename) {
      const url = partnerService.getThumbnailUrl(filename);
      return url;
    },
    handleImageError(event) {
      event.target.src = '/images/default-product.jpg';
    },
    async loadFishingReports() {
      try {
        console.log('조황정보 로딩 시작, prodId:', this.prodId);
        const response = await partnerService.getFishingReports(this.prodId);
        console.log('조황정보 응답 데이터:', response.data);
        this.reports = response.data.map(report => ({
          ...report,
          productName: report.prodName || '상품 정보 없음'
        }));
        this.applyFilters();
      } catch (error) {
        console.error('조황정보 로딩 실패:', error);
        alert('조황정보를 불러오지 못했습니다.');
      }
    },
    applyFilters() {
      this.filteredReports = this.reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            report.content.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesSearch;
      });
    },
    searchReports() {
      this.applyFilters();
    },
    filterReports() {
      this.applyFilters();
    },
    viewReportDetail(frId) {
      if (frId) {
        sessionStorage.setItem('fishing-report-scroll', window.scrollY);
        this.$router.push(`/partner/market-info/${frId}`);
      } else {
        alert('상세보기 ID가 올바르지 않습니다.');
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
    async deleteReport(frId) {
      if (!confirm('정말로 이 조황정보를 삭제하시겠습니까?')) {
        return;
      }
      
      try {
        await partnerService.deleteFishingReport(frId);
        alert('조황정보가 삭제되었습니다.');
        await this.loadFishingReports(); // 목록 새로고침
      } catch (error) {
        console.error('조황정보 삭제 실패:', error);
        alert('조황정보 삭제에 실패했습니다.');
      }
    }
  },
  mounted() {
    this.loadFishingReports().then(() => {
      const savedScroll = sessionStorage.getItem('fishing-report-scroll');
      if (savedScroll) {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' });
        sessionStorage.removeItem('fishing-report-scroll');
      }
    });
  }
};
</script>


<style scoped>
.fishing-report-manager {
  padding: 30px;
  max-width: 1200px;
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

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  gap: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

.search-box input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.search-button {
  padding: 12px 24px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
}

.search-button:hover {
  background: #283593;
  transform: translateY(-2px);
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options select {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-options select:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.fishing-report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.report-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.report-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
}

.report-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
}

.report-card:hover .report-image img {
  transform: scale(1.05);
}

.date-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: white;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.6);
}

.report-info {
  padding: 20px;
}

.report-title {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-content-preview {
  margin: 0;
  color: #666;
  font-size: 1rem;
  line-height: 1.4;
  height: 4.2em; /* 3 lines of text */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.no-reports-grid {
  text-align: center;
  padding: 80px;
  color: #666;
  font-size: 1.3rem;
  background: #ffffff;
  border-radius: 10px;
  border: 1px dashed #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  grid-column: 1 / -1; /* Take full width in grid */
}

.product-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 6px;
  font-size: 0.9rem;
}

.product-label {
  font-weight: 600;
  color: #1a237e;
  margin-right: 8px;
}

.product-name {
  color: #333;
}

.report-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.delete-button {
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .fishing-report-manager {
    padding: 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-options {
    width: 100%;
    justify-content: space-between;
  }

  .fishing-report-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .report-image {
    height: 180px;
  }

  .report-title {
    font-size: 1.3rem;
  }

  .report-content-preview {
    height: 3.6em; /* 3 lines of text */
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .fishing-report-grid {
    grid-template-columns: 1fr;
  }

  .report-card {
    margin-bottom: 20px;
  }
}
</style> 