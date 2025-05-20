<script>
import api from '@/lib/axios.js'

api.get('/api/fishing-report/get-all')
    .then(res => {
      console.log(res.data)
    })

</script>

<template>

</template>

<style scoped>

</style>