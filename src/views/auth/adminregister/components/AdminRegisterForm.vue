<template>
  <form @submit.prevent="handleRegister" class="admin-form">
    <div class="form-group">
      <label for="aid">아이디</label>
      <div class="input-wrapper">
        <input
          type="text"
          id="aid"
          v-model="registerForm.aid"
          required
          placeholder="관리자 아이디를 입력하세요"
          @input="validateAid"
        />
        <span class="input-icon"><i class="fas fa-user"></i></span>
      </div>
      <span class="error-message" v-if="errors.aid">{{ errors.aid }}</span>
    </div>
    <div class="form-group">
      <label for="apw">비밀번호</label>
      <div class="input-wrapper">
        <input
          type="password"
          id="apw"
          v-model="registerForm.apw"
          required
          placeholder="영문, 숫자를 포함한 비밀번호를 입력하세요"
          @input="validatePassword"
        />
        <span class="input-icon"><i class="fas fa-lock"></i></span>
      </div>
      <span class="error-message" v-if="errors.apw">{{ errors.apw }}</span>
    </div>
    <div class="form-group">
      <label for="apwConfirm">비밀번호 확인</label>
      <div class="input-wrapper">
        <input
          type="password"
          id="apwConfirm"
          v-model="apwConfirm"
          required
          placeholder="비밀번호를 다시 입력하세요"
          @input="validatePasswordConfirm"
        />
        <span class="input-icon"><i class="fas fa-lock"></i></span>
      </div>
      <span class="error-message" v-if="errors.apwConfirm">{{ errors.apwConfirm }}</span>
    </div>
    <div class="form-group">
      <label for="aname">이름</label>
      <div class="input-wrapper">
        <input
          type="text"
          id="aname"
          v-model="registerForm.aname"
          required
          placeholder="이름을 입력하세요 (2글자 이상)"
          @input="validateName"
        />
        <span class="input-icon"><i class="fas fa-user"></i></span>
      </div>
      <span class="error-message" v-if="errors.aname">{{ errors.aname }}</span>
    </div>
    <button type="submit" class="admin-btn" :disabled="!isFormValid">회원가입</button>
  </form>
</template>

<script>
import axios from '@/api/axios';

export default {
  name: 'AdminRegisterForm',
  data() {
    return {
      registerForm: {
        aid: '',
        apw: '',
        aname: ''
      },
      apwConfirm: '',
      errors: {
        aid: '',
        apw: '',
        apwConfirm: '',
        aname: ''
      }
    };
  },
  computed: {
    isFormValid() {
      return !this.errors.aid && 
             !this.errors.apw && 
             !this.errors.apwConfirm && 
             !this.errors.aname &&
             this.registerForm.aid &&
             this.registerForm.apw &&
             this.apwConfirm &&
             this.registerForm.aname;
    }
  },
  methods: {
    validateAid() {
      const aidRegex = /^[a-zA-Z0-9]+$/;
      if (!this.registerForm.aid) {
        this.errors.aid = '아이디를 입력해주세요.';
      } else if (!aidRegex.test(this.registerForm.aid)) {
        this.errors.aid = '아이디는 영문과 숫자만 사용 가능합니다.';
      } else {
        this.errors.aid = '';
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!this.registerForm.apw) {
        this.errors.apw = '비밀번호를 입력해주세요.';
      } else if (!passwordRegex.test(this.registerForm.apw)) {
        this.errors.apw = '비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.';
      } else {
        this.errors.apw = '';
      }
      this.validatePasswordConfirm();
    },
    validatePasswordConfirm() {
      if (!this.apwConfirm) {
        this.errors.apwConfirm = '비밀번호 확인을 입력해주세요.';
      } else if (this.registerForm.apw !== this.apwConfirm) {
        this.errors.apwConfirm = '비밀번호가 일치하지 않습니다.';
      } else {
        this.errors.apwConfirm = '';
      }
    },
    validateName() {
      if (!this.registerForm.aname) {
        this.errors.aname = '이름을 입력해주세요.';
      } else if (this.registerForm.aname.length < 2) {
        this.errors.aname = '이름은 2글자 이상이어야 합니다.';
      } else {
        this.errors.aname = '';
      }
    },
    async handleRegister() {
      if (!this.isFormValid) {
        return;
      }
      try {
        const response = await axios.post('/api/admin/register', this.registerForm);
        alert('관리자 회원가입이 완료되었습니다.');
        this.$router.push('/admin/login');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          alert(error.response.data);
        } else {
          alert('회원가입 중 오류가 발생했습니다.');
        }
      }
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
.admin-form {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label {
  color: #1976ed;
  font-weight: 600;
  font-size: 1.08rem;
}
.input-wrapper {
  position: relative;
}
input {
  width: 100%;
  padding: 1.1rem 2.7rem 1.1rem 1.1rem;
  border: 1.5px solid #e3eaf5;
  border-radius: 8px;
  font-size: 1.13rem;
  background: #f7fafd;
  transition: border 0.2s;
}
input:focus {
  border: 1.5px solid #1976ed;
  background: #fff;
  outline: none;
}
.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #b0b8c1;
  font-size: 1.2rem;
}
.admin-btn {
  width: 100%;
  padding: 1.15rem;
  background: #1976ed;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.18rem;
  font-weight: 700;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(25, 118, 237, 0.08);
}
.admin-btn:hover {
  background: #1256b8;
}
.error-message {
  color: #d93025;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  margin-left: 2px;
}
@media (max-width: 600px) {
  .admin-form {
    padding: 0 0.5rem;
    max-width: 98vw;
  }
  input {
    padding: 0.9rem 2.2rem 0.9rem 0.9rem;
    font-size: 1rem;
  }
  .admin-btn {
    padding: 1rem;
    font-size: 1.1rem;
  }
}
</style> 