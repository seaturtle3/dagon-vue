<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="text-center mb-4">회원가입</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group mb-3">
          <label for="uid" class="form-label">아이디 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-user"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="uid"
              v-model="formData.uid"
              required
              placeholder="아이디를 입력하세요"
              pattern="^[a-zA-Z0-9]{4,20}$"
              @input="validateId"
            />
          </div>
          <small class="form-text text-muted">4~20자의 영문 대소문자와 숫자만 사용 가능합니다.</small>
          <div v-if="validationErrors.uid" class="text-danger mt-1">
            {{ validationErrors.uid }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="upw" class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-lock"></i>
            </span>
            <input
              type="password"
              class="form-control"
              id="upw"
              v-model="formData.upw"
              required
              placeholder="비밀번호를 입력하세요"
              @input="validatePassword"
            />
          </div>
          <small class="form-text text-muted">8자 이상의 영문 대소문자와 숫자를 포함해야 합니다.</small>
          <div v-if="validationErrors.upw" class="text-danger mt-1">
            {{ validationErrors.upw }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="confirmPassword" class="form-label">비밀번호 확인 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-lock"></i>
            </span>
            <input
              type="password"
              class="form-control"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              required
              placeholder="비밀번호를 다시 입력하세요"
              @input="validatePasswordConfirm"
            />
          </div>
          <div v-if="validationErrors.confirmPassword" class="text-danger mt-1">
            {{ validationErrors.confirmPassword }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="uname" class="form-label">이름 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-user"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="uname"
              v-model="formData.uname"
              required
              placeholder="이름을 입력하세요"
              @input="validateName"
            />
          </div>
          <div v-if="validationErrors.uname" class="text-danger mt-1">
            {{ validationErrors.uname }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="email" class="form-label">이메일 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-envelope"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="emailId"
              v-model="formData.emailId"
              required
              placeholder="이메일"
            />
            <span class="input-group-text">@</span>
            <select class="form-select" v-model="formData.emailDomain">
              <option value="">선택하세요</option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="custom">직접입력</option>
            </select>
          </div>
          <div v-if="formData.emailDomain === 'custom'" class="mt-2">
            <input
              type="text"
              class="form-control"
              v-model="formData.customEmailDomain"
              placeholder="도메인을 입력하세요"
            />
          </div>
          <div v-if="validationErrors.email" class="text-danger mt-1">
            {{ validationErrors.email }}
          </div>
        </div>

        <div class="form-group mb-4">
          <label for="phone" class="form-label">전화번호 <span class="text-danger">*</span></label>
          <div class="input-group">
            <select class="form-select" style="max-width: 100px;" v-model="formData.phone1">
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="018">018</option>
              <option value="019">019</option>
            </select>
            <span class="input-group-text">-</span>
            <input
              type="text"
              class="form-control"
              v-model="formData.phone2"
              maxlength="4"
              required
              placeholder="1234"
              @input="validatePhone"
            />
            <span class="input-group-text">-</span>
            <input
              type="text"
              class="form-control"
              v-model="formData.phone3"
              maxlength="4"
              required
              placeholder="5678"
              @input="validatePhone"
            />
          </div>
          <div v-if="validationErrors.phone" class="text-danger mt-1">
            {{ validationErrors.phone }}
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="!isFormValid">회원가입</button>
        <div class="text-center">
          <router-link to="/login" class="text-decoration-none">이미 계정이 있으신가요? 로그인하기</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/lib/axios';

export default {
  name: 'RegisterForm',
  data() {
    return {
      formData: {
        uid: '',
        upw: '',
        confirmPassword: '',
        uname: '',
        emailId: '',
        emailDomain: '',
        customEmailDomain: '',
        phone1: '010',
        phone2: '',
        phone3: ''
      },
      validationErrors: {
        uid: '',
        upw: '',
        confirmPassword: '',
        uname: '',
        email: '',
        phone: ''
      }
    }
  },
  computed: {
    isFormValid() {
      return !Object.values(this.validationErrors).some(error => error !== '') &&
             this.formData.uid &&
             this.formData.upw &&
             this.formData.confirmPassword &&
             this.formData.uname &&
             this.formData.emailId &&
             this.formData.emailDomain &&
             this.formData.phone1 &&
             this.formData.phone2 &&
             this.formData.phone3;
    }
  },
  methods: {
    validateId() {
      const idRegex = /^[a-zA-Z0-9]{4,20}$/;
      if (!idRegex.test(this.formData.uid)) {
        this.validationErrors.uid = '아이디는 4~20자의 영문 대소문자와 숫자만 사용 가능합니다.';
      } else {
        this.validationErrors.uid = '';
      }
    },
    validatePassword() {
      const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!pwRegex.test(this.formData.upw)) {
        this.validationErrors.upw = '비밀번호는 8자 이상의 영문 대소문자와 숫자를 포함해야 합니다.';
      } else {
        this.validationErrors.upw = '';
      }
      this.validatePasswordConfirm();
    },
    validatePasswordConfirm() {
      if (this.formData.upw !== this.formData.confirmPassword) {
        this.validationErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      } else {
        this.validationErrors.confirmPassword = '';
      }
    },
    validateName() {
      const nameRegex = /^[가-힣]{2,10}$/;
      if (!nameRegex.test(this.formData.uname)) {
        this.validationErrors.uname = '이름은 2~10자의 한글만 사용 가능합니다.';
      } else {
        this.validationErrors.uname = '';
      }
    },
    validatePhone() {
      const phoneRegex = /^\d{3,4}$/;
      if (!phoneRegex.test(this.formData.phone2) || !phoneRegex.test(this.formData.phone3)) {
        this.validationErrors.phone = '전화번호 형식이 올바르지 않습니다.';
      } else {
        this.validationErrors.phone = '';
      }
    }, 
    async handleSubmit() {
      try {
        const params = new URLSearchParams();
        params.append('uid', this.formData.uid);
        params.append('upw', this.formData.upw);
        params.append('uname', this.formData.uname);
        params.append('email', `${this.formData.emailId}@${this.formData.emailDomain === 'custom' ? this.formData.customEmailDomain : this.formData.emailDomain}`);
        params.append('phone1', this.formData.phone1);
        params.append('phone2', this.formData.phone2);
        params.append('phone3', this.formData.phone3);

        const response = await api.post('/api/users/register', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.data === "회원가입 성공") {
          alert('회원가입이 완료되었습니다.');
          this.$router.push('/login');
        } else {
          alert(response.data || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원가입 에러:', error);
        if (error.response?.data) {
          alert(error.response.data);
        } else if (error.message.includes('Network Error')) {
          alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert('회원가입 처리 중 오류가 발생했습니다.');
        }
      }
    }
  }
}
</script>

<script setup>
// Font Awesome CDN 추가
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
document.head.appendChild(fontAwesomeScript);
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23f0f0f0" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.register-form {
  background: #ffffff;
  padding: 3rem 4rem;
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  border: 1px solid #e2e8f0;
}

.register-form::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 20px;
  z-index: -1;
  opacity: 0.1;
}

h2 {
  color: #2d3748;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  display: block;
}

.input-group {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-group:focus-within {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.input-group-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 1rem;
  font-size: 1.1rem;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control, .form-select {
  border: none;
  background: #f8fafc;
  padding: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  background: white;
  box-shadow: none;
  outline: none;
}

.form-control::placeholder {
  color: #a0aec0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-top: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #cbd5e0;
  transform: none;
  box-shadow: none;
}

.form-text {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.5rem;
}

.text-danger {
  color: #e53e3e !important;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.text-center a {
  font-size: 1rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.text-center a:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-form {
  animation: fadeInUp 0.6s ease-out;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .register-form {
    padding: 2rem;
    margin: 1rem;
    border-radius: 15px;
  }
  
  h2 {
    font-size: 2rem;
  }
  
  .input-group-text {
    padding: 0.875rem;
    font-size: 1rem;
  }
  
  .form-control, .form-select {
    padding: 0.875rem;
  }
  
  .btn-primary {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .register-form {
    padding: 1.5rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }
}
</style>
