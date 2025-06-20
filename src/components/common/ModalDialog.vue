<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>
      <div class="modal-body">
        <slot>
          <p>{{ message }}</p>
        </slot>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="onConfirm">{{ confirmText || '확인' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: String,
  onConfirm: Function
});
</script>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  padding: 1rem 1.2rem;
  min-width: 180px;
  max-width: 350px;
  text-align: center;
  margin: 0 auto;
}
</style> 