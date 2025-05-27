<template>
  <div>
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

<script>
import ReservationBox from '@/components/ReservationBox.vue'
import NoticeBox from '@/components/NoticeBox.vue'
import SideButtons from '@/components/SideButtons.vue'
import RecommendationList from '@/components/RecommendationList.vue'
import PopularList from '@/components/PopularList.vue'

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
