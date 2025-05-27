<script>
import ReservationBox from '@/components/home/ReservationBox.vue'
import NoticeBox from '@/components/home/NoticeBox.vue'
import SideButtons from '@/components/home/SideButtons.vue'
import RecommendationList from '@/components/home/RecommendationList.vue'
import PopularList from '@/components/home/PopularList.vue'

export default {
  name: 'HomePage',
  components: {
    ReservationBox,
    NoticeBox,
    SideButtons,
    RecommendationList,
    PopularList
  }
}
</script>

<template>
  <div class="home">
    <div class="row mb-4">
      <div class="col-md-4">
        <ReservationBox />
      </div>
      <div class="col-md-8">
        <NoticeBox />
      </div>
    </div>
    <SideButtons />
    <RecommendationList />
    <PopularList />
  </div>
</template>

<style>
.home {
  width: 80%;
  margin: 0 auto;
}
</style>
