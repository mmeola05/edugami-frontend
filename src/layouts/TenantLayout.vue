<template>
  <q-layout view="lHh Lpr lFf" class="tenant-admin-layout">
    <tenant-header
      :drawer-open="sidebarPinned"
      @toggle-drawer="toggleSidebarPinned"
    />

    <tenant-sidebar
      v-model="leftDrawerOpen"
      :expanded="sidebarExpanded"
      :pinned="sidebarPinned"
      @hover-change="sidebarHover = $event"
    />

    <q-page-container class="main-page-container">
      <router-view v-slot="{ Component }">
        <transition
          appear
          enter-active-class="page-enter-active"
          leave-active-class="page-leave-active"
          enter-from-class="page-enter-from"
          leave-to-class="page-leave-to"
          mode="out-in"
        >
          <component
            :is="Component"
            :key="$route.fullPath"
            class="page-transition-wrapper"
          />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from "vue";
import TenantHeader from "components/layout/TenantHeader.vue";
import TenantSidebar from "components/layout/TenantSidebar.vue";
import { useAppStore } from "src/stores/appStore";

const appStore = useAppStore();
const sidebarHover = ref(false);

const leftDrawerOpen = computed({
  get: () => appStore.sidebarOpen,
  set: (val) => appStore.setSidebarOpen(val),
});

const sidebarPinned = computed(() => appStore.sidebarPinned);
const sidebarExpanded = computed(
  () => sidebarPinned.value || sidebarHover.value,
);

function toggleSidebarPinned() {
  appStore.toggleSidebarPinned();
  sidebarHover.value = false;
  appStore.setSidebarOpen(true);
}
</script>

<style scoped lang="scss">
.tenant-admin-layout {
  background:
    radial-gradient(circle at 18% 10%, rgba(36, 21, 242, 0.035), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(95, 41, 255, 0.035), transparent 24%),
    var(--eg-bg, var(--color-bg-primary));
  color: var(--color-text-primary);
  min-height: 100vh;
  transition: var(--transition-color);
}

.main-page-container {
  background: transparent;
  min-height: 100vh;
  min-width: 0;
  overflow-x: hidden;
}

.page-transition-wrapper {
  min-height: calc(100vh - 68px);
}

.page-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.page-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.page-enter-from {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
}

.page-leave-to {
  opacity: 0;
  transform: translate3d(0, -8px, 0);
}
</style>
