<template>
  <div class="center">
    <ReportFormView :edit-mode="editMode" :report-id="reportId" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ReportFormView from './components/ReportFormView.vue'

const route = useRoute()
const editMode = route.name === 'FishingReportEdit'
const reportId = route.params.frId
</script>

<style>
.center {
  width: 80%;
  margin: 4% auto;
}
</style>