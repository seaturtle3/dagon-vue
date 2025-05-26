<template>
  <nav class="flex justify-between items-center border-b pb-2 mb-4">
    <div class="flex space-x-4">
      <a href="#">조황센터</a>
      <a href="#">바다낚시</a>
      <a href="#">민물낚시</a>
      <a href="#">커뮤니티</a>
      <a href="#">고객센터</a>
    </div>
    <div class="flex space-x-2">
      <button>로그인</button>
      <button>회원가입</button>
      <button class="text-red-500">신고하기</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'HeaderNav'
};
</script>
