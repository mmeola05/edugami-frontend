<template>
  <q-btn
    flat
    round
    dense
    :icon="isDark ? 'light_mode' : 'dark_mode'"
    @click="toggleTheme"
    class="theme-toggle"
  >
    <q-tooltip>{{
      isDark ? $t("common.theme_light") : $t("common.theme_dark")
    }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { computed } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

function toggleTheme() {
  $q.dark.toggle();
  localStorage.setItem("edugami_theme", $q.dark.isActive ? "dark" : "light");
}
</script>

<style scoped lang="scss">
.theme-toggle {
  color: var(--color-text-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
    transform: rotate(12deg) scale3d(1.06, 1.06, 1);
  }
}
</style>
