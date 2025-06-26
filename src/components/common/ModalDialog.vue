<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <slot name="header-action"></slot>
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
.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-bottom: 0.5rem;
}
.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 auto;
}
.header-action-btn {
  position: absolute;
  left: 0.2rem;
  top: 0.2rem;
  background: none;
  border: none;
  color: #b71c1c;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-action-btn:hover {
  background: #ffeaea;
}
</style> 