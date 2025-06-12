<template>
  <div class="partner-application-form">
    <h2>낚시배 파트너 신청</h2>
    <form @submit.prevent="submitForm" enctype="multipart/form-data" novalidate>
      <div class="form-row">
        <label>파트너명 <span class="required">*</span></label>
        <input v-model="form.pname" required maxlength="50" placeholder="예) 바다낚시터" />
        <span v-if="errors.pname" class="input-error">{{ errors.pname }}</span>
      </div>
      <div class="form-row">
        <label>대표자명 <span class="required">*</span></label>
        <input v-model="form.ceoName" required maxlength="50" placeholder="예) 홍길동" />
        <span v-if="errors.ceoName" class="input-error">{{ errors.ceoName }}</span>
      </div>
      <div class="form-row">
        <label>주소 <span class="required">*</span></label>
        <input v-model="form.paddress" required maxlength="100" placeholder="예) 부산광역시 해운대구" />
        <span v-if="errors.paddress" class="input-error">{{ errors.paddress }}</span>
      </div>
      <div class="form-row">
        <label>파트너 정보</label>
        <textarea v-model="form.pinfo" maxlength="500" placeholder="낚시배/업체에 대한 상세 설명을 입력해 주세요."></textarea>
        <span v-if="errors.pinfo" class="input-error">{{ errors.pinfo }}</span>
      </div>
      <div class="form-row">
        <label>사업자번호 <span class="required">*</span></label>
        <input v-model="form.license" required maxlength="20" pattern="[0-9\-]+" placeholder="예) 123-45-67890" />
        <span v-if="errors.license" class="input-error">{{ errors.license }}</span>
      </div>
      <div class="form-row">
        <label>사업자등록증 이미지 <span class="required">*</span></label>
        <input type="file" @change="onFileChange" accept="image/*" required />
        <span v-if="errors.imageFile" class="input-error">{{ errors.imageFile }}</span>
      </div>
      <button type="submit" class="submit-btn">신청하기</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </form>
  </div>
</template>

<script>
import { registerPartnerApplication } from '@/api/partnerApplication';

export default {
  data() {
    return {
      form: {
        pname: '',
        ceoName: '',
        paddress: '',
        pinfo: '',
        license: ''
      },
      imageFile: null,
      error: null,
      success: null,
      errors: {}
    };
  },
  methods: {
    onFileChange(e) {
      this.imageFile = e.target.files[0];
    },
    validateForm() {
      const errors = {};
      if (!this.form.pname) errors.pname = '파트너명을 입력하세요.';
      if (!this.form.ceoName) errors.ceoName = '대표자명을 입력하세요.';
      if (!this.form.paddress) errors.paddress = '주소를 입력하세요.';
      if (!this.form.license) errors.license = '사업자번호를 입력하세요.';
      else if (!/^(\d{3}-\d{2}-\d{5}|\d{10})$/.test(this.form.license)) errors.license = '사업자번호 형식이 올바르지 않습니다. (예: 123-45-67890 또는 1234567890)';
      if (!this.imageFile) errors.imageFile = '사업자등록증 이미지를 첨부하세요.';
      if (this.form.pinfo && this.form.pinfo.length > 500) errors.pinfo = '파트너 정보는 500자 이내로 입력하세요.';
      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    async submitForm() {
      this.error = null;
      this.success = null;
      if (!this.validateForm()) return;
      try {
        const formData = new FormData();
        const formCopy = { ...this.form, license: this.form.license.replace(/-/g, '') };
        formData.append('data', new Blob([JSON.stringify(formCopy)], { type: 'application/json' }));
        formData.append('businessLicenseImage', this.imageFile);

        await registerPartnerApplication(formData);
        this.success = '파트너 신청이 완료되었습니다.';
        this.form = { pname: '', ceoName: '', paddress: '', pinfo: '', license: '' };
        this.imageFile = null;
        this.errors = {};
      } catch (err) {
        this.error = err.response?.data || '신청 중 오류가 발생했습니다.';
      }
    }
  }
};
</script>

<style scoped>
.partner-application-form {
  max-width: 480px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}
.partner-application-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-row {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}
.form-row label {
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.form-row .required {
  color: #e74c3c;
  font-size: 1rem;
}
.form-row input,
.form-row textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
.form-row textarea {
  min-height: 80px;
  resize: vertical;
}
.input-error {
  color: #e74c3c;
  font-size: 0.95rem;
  margin-top: 0.2rem;
}
.submit-btn {
  width: 100%;
  padding: 0.7rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.submit-btn:hover {
  background: #217dbb;
}
.error {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}
.success {
  color: #2ecc71;
  margin-top: 1rem;
  text-align: center;
}
</style> 