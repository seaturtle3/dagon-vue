<template>
  <div class="partner-info">
    <h2>파트너 정보</h2>

    <div class="info-section">
      <h3>기본 정보</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>상호명</label>
          <div class="value">{{ partnerInfo.pname || '-' }}</div>
        </div>
        <div class="info-item">
          <label>사업자등록번호</label>
          <div class="value">{{ partnerInfo.license || '-' }}</div>
        </div>
        <div class="info-item">
          <label>대표자명</label>
          <div class="value">{{ partnerInfo.ceoName || '-' }}</div>
        </div>
        <div class="info-item">
          <label>연락처</label>
          <div class="value">{{ partnerInfo.fullPhone || '-' }}</div>
        </div>
        <div class="info-item">
          <label>이메일</label>
          <div class="value">{{ partnerInfo.email || '-' }}</div>
        </div>
        <div class="info-item">
          <label>주소</label>
          <div class="value">{{ partnerInfo.paddress || '-' }}</div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>사업자 등록증</h3>
      <div class="license-image">
        <img :src="getFullLicenseImgPath(partnerInfo.licenseImg)" alt="사업자 등록증 이미지가 없습니다."/>
      </div>
    </div>

    <div class="info-section">
      <h3>소개</h3>
      <div class="info-content">
        {{ partnerInfo.pinfo || '등록된 소개가 없습니다.' }}
      </div>
    </div>

    <div class="info-section notice-box">
      <h3>정보 수정 안내</h3>
      <div class="notice-content">
        파트너 정보 수정을 원하시는 경우, 1:1 문의를 통해 수정하고자 하는 정보를 관리자 문의로 보내주시면 확인 후 수정해드리겠습니다.
      </div>
      <div class="button-group">
      </div>
    </div>
  </div>
</template>

<script>
import {partnerService} from '@/api/partner';
import { BASE_URL } from '@/constants/baseUrl.js';

export default {
  name: 'PartnerInfo',
  data() {
    return {
      partnerInfo: {
        pname: '',
        license: '',
        ceoName: '',
        fullPhone: '',
        email: '',
        pAddress: '',
        pInfo: '',
        licenseImg: ''
      }
    };
  },
  created() {
    this.fetchPartnerInfo();
  },

  methods: {
    async fetchPartnerInfo() {
      try {
        const response = await partnerService.getPartnerInfo();
        this.partnerInfo = response.data;
      } catch (error) {
        console.error('파트너 정보 조회 실패:', error);
      }
    },
    getFullLicenseImgPath(path) {
      if (!path) {
        return '/img/default-license.png';
      }
      if (path.startsWith('http')) {
        return path;
      }
      let fileName = path.split(/[/\\]/).pop();
      return `${BASE_URL}/uploads/${fileName}`;
    },
    goToInquiry() {
      this.$router.push('/partner/inquiries');
    }
  }
};
</script>

<style scoped>
.partner-info {
  padding: 2rem;
  background-color: #e3f2fd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #1565c0;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #90caf9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

h3 {
  color: #1976d2;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #1976d2;
  font-weight: 600;
  font-size: 0.95rem;
}

.value {
  color: #2c3e50;
  padding: 0.8rem;
  background-color: #f5f9ff;
  border-radius: 6px;
  border: 1px solid #90caf9;
  font-size: 1rem;
}

.license-image {
  max-width: 500px;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.license-image img {
  width: 100%;
  height: auto;
  display: block;
}

.info-content {
  padding: 1.2rem;
  background-color: #f5f9ff;
  border-radius: 6px;
  border: 1px solid #90caf9;
  min-height: 100px;
  white-space: pre-wrap;
  color: #2c3e50;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.inquiry-button {
  background-color: #d32f2f;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inquiry-button:hover {
  background-color: #b71c1c;
}

.notice-box {
  background-color: #fff5f5;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 1.5rem;
}

.notice-content {
  color: #d32f2f;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .partner-info {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 1.8rem;
  }

  h3 {
    font-size: 1.3rem;
  }

  .button-group {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style> 