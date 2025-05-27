<script>
import api from '@/lib/axios.js'

api.get('/api/fishing-report/get-all')
    .then(res => {
      console.log(res.data)
    })

console.log('라우터 확인')
</script>

<template>
<h1>조황센터 테스트</h1>

</template>

<style scoped>

</style>