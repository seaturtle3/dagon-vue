<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emit = defineEmits(['edit', 'delete'])
const props = defineProps({
  showTopMenu: { type: Boolean, default: false }
})

const isAdmin = ref(false)
const showMenu = ref(false)
const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const adminRoles = ['ADMIN', 'SUPER_ADMIN']
      isAdmin.value = adminRoles.includes(payload.role)
    } catch (e) {
      isAdmin.value = false
    }
  }
})

const handleEdit = () => { showMenu.value = false; emit('edit') }
const handleDelete = () => { showMenu.value = false; emit('delete') }
const handleBack = () => router.back()
const toggleMenu = () => showMenu.value = !showMenu.value
const closeMenu = () => showMenu.value = false
</script>

<template>
  <div>
    <!-- 상단 점세개 메뉴 (showTopMenu) -->
    <template v-if="showTopMenu && isAdmin">
      <div class="top-menu">
        <button class="icon-btn" @click="toggleMenu">
          <font-awesome-icon :icon="['fas', 'ellipsis-v']" />
        </button>
        <div v-if="showMenu" class="popover-menu" @click.outside="closeMenu">
          <button class="popover-item edit" @click="handleEdit">
            <font-awesome-icon :icon="['fas', 'pen']" />
          </button>
          <button class="popover-item delete" @click="handleDelete">
            <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
        </div>
      </div>
    </template>

    <!-- 하단 액션 버튼 (showTopMenu가 아닐 때만) -->
    <template v-else>
      <div class="detail-action text-end mt-3">
        <template v-if="isAdmin">
          <button class="btn-custom btn-edit me-2" @click="handleEdit">수정</button>
          <button class="btn-custom btn-delete me-2" @click="handleDelete">삭제</button>
        </template>
        <button class="btn-custom btn-list" @click="handleBack">목록</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.top-menu {
  position: absolute;
  top: 12px;
  right: 18px;
  z-index: 10;
}
.icon-btn {
  background: none;
  border: none;
  font-size: 1.7rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0 8px;
}
.popover-menu {
  position: absolute;
  top: 32px;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  min-width: 50px;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.popover-item {
  background: none;
  border: none;
  text-align: left;
  padding: 10px 16px;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.popover-item.edit i {
  color: #1976d2;
}
.popover-item.delete i {
  color: #e53e3e;
}
.popover-item:hover {
  background: #f1f5f9;
}
.detail-action button {
  min-width: 80px;
  text-align: center;
}

/* 커스텀 버튼 스타일 - 다른 컴포넌트들과 통일 */
.btn-custom {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-edit {
  background-color: #fff;
  color: #1976d2;
  border-color: #1976d2;
}

.btn-edit:hover {
  background-color: #1976d2;
  color: #fff;
}

.btn-delete {
  background-color: #fff;
  color: #e53e3e;
  border-color: #e53e3e;
}

.btn-delete:hover {
  background-color: #e53e3e;
  color: #fff;
}

.btn-list {
  background-color: #fff;
  color: #6c757d;
  border-color: #6c757d;
}

.btn-list:hover {
  background-color: #6c757d;
  color: #fff;
}
</style>