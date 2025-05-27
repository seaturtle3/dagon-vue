<script lang="ts">
import api from '@/lib/axios.js'

api.get('/api/product/get-all')
    .then(res => {
      console.log(res.data)
    })

</script>

<template>



</template>

<style scoped>

</style>