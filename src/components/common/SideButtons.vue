<template>
  <div class="side-buttons">
    <!-- 파트너 전용 플러스 버튼 (PC에서만 표시) -->
    <div v-if="isPartner && isDesktop" class="partner-quick-actions">
      <div class="dropdown">
        <button class="side-button partner-button" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="button-content">
            <div class="icon-wrapper partner-icon">
              <font-awesome-icon :icon="['fas', 'plus']" />
            </div>
            <span class="button-text">등록</span>
          </div>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <router-link class="dropdown-item" to="/partner/products/register">
              <font-awesome-icon :icon="['fas', 'fish']" class="me-2" />상품등록
            </router-link>
          </li>
          <li>
            <router-link class="dropdown-item" to="/fishing-report/create">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="me-2" />조황정보등록
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    
    <button class="side-button sea-button" @click="navigateToSea">
      <div class="button-content">
        <div class="icon-wrapper sea-icon">
          <font-awesome-icon :icon="['fas', 'water']" />
        </div>
        <span class="button-text">바다</span>
      </div>
    </button>
    <button class="side-button freshwater-button" @click="navigateToFreshwater">
      <div class="button-content">
        <div class="icon-wrapper freshwater-icon">
          <font-awesome-icon :icon="['fas', 'fish']" />
        </div>
        <span class="button-text">민물</span>
      </div>
    </button>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAdminAuthStore } from '@/store/auth/auth.js'

export default {
  name: 'SideButtons',
  components: { FontAwesomeIcon },
  setup() {
    const router = useRouter()
    const authStore = useAdminAuthStore()
    
    // 화면 크기 감지
    const windowWidth = ref(window.innerWidth)
    const isDesktop = computed(() => windowWidth.value >= 1024)
    
    // 파트너 권한 확인
    const isPartner = computed(() => {
      if (!authStore.user || !authStore.user.role) return false;
      const role = String(authStore.user.role).toUpperCase();
      return role === 'PARTNER';
    })

    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }

    const navigateToSea = () => {
      router.push('/products/sea')
    }

    const navigateToFreshwater = () => {
      router.push('/products/freshwater')
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      navigateToSea,
      navigateToFreshwater,
      isPartner,
      isDesktop
    }
  }
};
</script>

<style scoped>
.side-buttons {
  position: fixed;
  top: 50%;
  right: var(--spacing-md);
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  z-index: var(--z-fixed);
}

.side-button {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #fff;
  border: 1.5px solid #b4d4e9;
  color: #38bdf8;
  font-weight: 600;
  box-shadow: 0 2px 8px 0 rgba(56, 189, 248, 0.08);
  outline: none;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.side-button:hover {
  background: #e0f2fe;
  color: #0ea5e9;
  box-shadow: 0 4px 12px 0 rgba(56, 189, 248, 0.10);
  border-color: #38bdf8;
}

.side-button:active {
  background: #bae6fd;
  color: #0369a1;
  box-shadow: 0 2px 8px 0 rgba(56, 189, 248, 0.08);
  border-color: #0ea5e9;
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.icon-wrapper {
  font-size: 1.2rem;
  line-height: 1;
}

.button-text {
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  line-height: 1;
  letter-spacing: 0.5px;
}

.sea-button {
  color: #38bdf8;
}

.sea-button:hover {
  color: #0ea5e9;
}

.freshwater-button {
  color: #46b98f;
}

.freshwater-button:hover {
  color: #059669;
}

.icon-wrapper.sea-icon i {
  color: #38bdf8;
}

.icon-wrapper.freshwater-icon i {
  color: #34d399;
}

/* 파트너 전용 버튼 스타일 */
.partner-button {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
}

.partner-button:hover {
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #059669;
  color: white;
}

.partner-button:active {
  background: linear-gradient(135deg, #047857, #065f46);
  border-color: #047857;
  color: white;
}

.icon-wrapper.partner-icon .fa-icon {
  color: white;
}

/* 드롭다운 메뉴 스타일 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  min-width: 160px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #10b981;
}

.dropdown-item .fa-icon {
  color: #10b981;
}

/* 반응형 */
@media (max-width: 768px) {
  .side-buttons {
    right: var(--spacing-sm);
    gap: var(--spacing-md);
  }
  .side-button {
    width: 50px;
    height: 50px;
    border-radius: 12px;
  }
  .icon-wrapper {
    font-size: 1rem;
  }
  .button-text {
    font-size: 0.6rem;
  }
}
</style>