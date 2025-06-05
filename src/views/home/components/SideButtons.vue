<template>
  <div class="nav position-fixed top-0 end-0 me-3 z-3 d-flex flex-column gap-2" style="width: 6%;">
    <button class="btn btn-light custom-border">바다 예약</button>
    <button class="btn btn-light custom-border">민물 예약</button>
    <div class="small text-muted custom-border p-2 bg-white">
      유저 정보: 로그인 필요<br />
      날씨: 로그인 필요
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideButtons'
};
</script>

<style>
.nav {
  margin-top: 10%;
}
.custom-border {
  border: 2px solid black;
  border-radius: 4px;
}
</style>