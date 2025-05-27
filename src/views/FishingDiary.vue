<script>
import api from '@/lib/axios.js'

api.get('/api/fishing-diary/get-all')
    .then(res => {
      console.log(res.data)
    })

console.log('조행기 api')
</script>

<template>
  <div class="fishing-diary">
    <h1>조황센터 테스트</h1>
  </div>
</template>

<style scoped>
.fishing-diary {
  width: 80%;
  margin: 0 auto;
}
</style>