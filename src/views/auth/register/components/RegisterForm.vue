<template>
  <div class="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white px-6 py-8 shadow-xl rounded-xl">
        <h2 class="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">회원가입</h2>
        <form @submit.prevent="submitForm" enctype="multipart/form-data" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label for="uid" class="block text-sm font-medium text-gray-700">아이디</label>
              <input v-model="form.uid" type="text" id="uid" required
                     class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>

            <div>
              <label for="upw" class="block text-sm font-medium text-gray-700">비밀번호</label>
              <input v-model="form.upw" type="password" id="upw" required
                     class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>

            <div>
              <label for="uname" class="block text-sm font-medium text-gray-700">이름</label>
              <input v-model="form.uname" type="text" id="uname" required
                     class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
              <input v-model="form.email" type="email" id="email" required
                     class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">전화번호</label>
              <div class="mt-1 flex space-x-2">
                <input v-model="form.phone1" type="text" maxlength="3" placeholder="010" required
                       class="block w-1/3 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                <input v-model="form.phone2" type="text" maxlength="4" placeholder="1234" required
                       class="block w-1/3 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                <input v-model="form.phone3" type="text" maxlength="4" placeholder="5678" required
                       class="block w-1/3 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
              </div>
            </div>
          </div>

          <div>
            <button type="submit"
                    class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              회원가입
            </button>
          </div>
        </form>

        <p v-if="message" class="mt-4 text-center text-sm" :class="{'text-red-600': message.includes('❗'), 'text-green-600': message.includes('🎉')}">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        uid: '',
        upw: '',
        uname: '',
        email: '',
        phone1: '',
        phone2: '',
        phone3: ''
      },
      message: ''
    };
  },
  methods: {
    async submitForm() {
      try {
        const formData = new FormData();
        for (const key in this.form) {
          formData.append(key, this.form[key]);
        }

        const response = await axios.post('/api/users/register', formData);
        this.message = '🎉 ' + response.data;
      } catch (error) {
        this.message = '❗ ' + (error.response?.data || '회원가입 실패');
      }
    }
  }
};
</script>
