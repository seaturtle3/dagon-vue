<script>
import api from '@/lib/axios.js'

export default {
  name: 'FishingDiary',
  data() {
    return {
      diaries: []
    }
  },
  mounted() {
    this.fetchDiaries();
    console.log('조행기 api')
  },
  methods: {
    async fetchDiaries() {
      try {
        const res = await api.get('/api/fishing-diary/get-all');
        this.diaries = res.data;
        console.log(this.diaries);
      } catch (err) {
        console.error('조행기 불러오기 실패', err);
      }
    }
  }
}

</script>

<template>
  <div class="fishing-diary">
    <h1>조행기 테스트</h1>
  </div>
</template>

<style scoped>
</style>