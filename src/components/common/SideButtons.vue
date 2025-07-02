<template>
  <div class="side-buttons">
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

export default {
  name: 'SideButtons',
  components: { FontAwesomeIcon },
  setup() {
    const router = useRouter()
    
    const navigateToSea = () => {
      router.push('/products/sea')
    }
    
    const navigateToFreshwater = () => {
      router.push('/products/freshwater')
    }
    
    return {
      navigateToSea,
      navigateToFreshwater
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