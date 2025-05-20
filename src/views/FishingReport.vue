<script>
import api from '@/lib/axios.js'

api.get('/fishing-report/get-all')
    .then(res => {
      console.log(res.data)
    })

</script>

<template>

</template>

<style scoped>

</style>