<script setup>

import MemberInquiry from '@/views/support/inquiry/components/MemberInquiry.vue'; // 실제 Inquiry 경로로 바꿔줘
import GuestInquiry from '@/views/support/inquiry/components/GuestInquiry.vue'; // 실제 Inquiry 경로로 바꿔줘
import { useAuthStore } from '@/store/login/loginStore'

const authStore = useAuthStore()

// 앱 진입 후 상태 복구가 필요한 경우
authStore.checkAuth()
const { isAuthenticated } = authStore

console.log('isAuthenticated:', isAuthenticated)

</script>

<template>
  <div>
    <MemberInquiry v-if="isAuthenticated" />
    <GuestInquiry v-else />
  </div>
</template>

<style scoped>

</style>
