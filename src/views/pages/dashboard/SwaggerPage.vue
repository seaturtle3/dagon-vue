<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>스웨거</h1>
      </div>
      <nav class="swagger-group-list">
        <div
          v-for="group in swaggerGroups"
          :key="group.name"
          :class="['swagger-group-item', { active: selectedSwaggerGroup === group.name }]"
          @click="selectSwaggerGroup(group.name)"
        >
          {{ group.label }}
        </div>
        <router-link to="/admin/dashboard" class="nav-item" active-class="nav-item-active">
          <font-awesome-icon icon="fa-solid fa-gauge" />
          <span>대시보드 바로가기</span>
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <div class="swagger-content">
        <div id="swagger-ui"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SwaggerUI from 'swagger-ui-dist/swagger-ui-es-bundle.js'
import 'swagger-ui-dist/swagger-ui.css'

const router = useRouter()

// 백엔드 application.properties의 스웨거 그룹 설정에 맞춤
const swaggerGroups = [
  { name: 'auth', label: '인증/사용자' },
  { name: 'product', label: '낚시배(상품)' },
  { name: 'fishing', label: '조황정보/조행기' },
  { name: 'booking', label: '예약/결제' },
  { name: 'board', label: '게시판' },
  { name: 'multtae', label: '물때와날씨' },
  { name: 'etc', label: '기타' }
]

const selectedSwaggerGroup = ref(swaggerGroups[0].name)

const selectSwaggerGroup = (name) => {
  selectedSwaggerGroup.value = name
}

const baseUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8095'

const renderSwagger = (groupName) => {
  SwaggerUI({
    url: `${baseUrl}/api-docs/${groupName}`,
    dom_id: '#swagger-ui',
    layout: 'BaseLayout', // 헤더 최소화
    deepLinking: true,
    docExpansion: 'none',
    validatorUrl: null,
    tagsSorter: 'alpha'
  })
}

watch(selectedSwaggerGroup, (newGroup) => {
  renderSwagger(newGroup)
})

onMounted(() => {
  renderSwagger(selectedSwaggerGroup.value)
})

const goDashboard = () => {
  router.push('/admin/dashboard')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.sidebar-header {
  padding: 1rem 0;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #fff;
}
.swagger-group-list {
  margin-top: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.swagger-group-item {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-weight: 500;
  transition: background 0.2s;
}
.swagger-group-item.active, .swagger-group-item:hover {
  background: #3498db;
  color: #fff;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s;
}
.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.nav-item-active {
  background-color: #3498db !important;
  color: #fff !important;
}
.nav-item .fa-gauge {
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
}
.main-content {
  flex: 1;
  padding: 1rem;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}
.swagger-content {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  border-radius: 10px;
  overflow: hidden;
}
</style>
