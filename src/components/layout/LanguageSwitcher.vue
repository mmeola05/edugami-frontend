<template>
  <q-btn-dropdown
    flat
    round
    dense
    no-icon-animation
    dropdown-icon="expand_more"
    class="lang-switcher"
    content-class="premium-menu"
  >
    <template #label>
      <div class="lang-label">
        <q-icon name="language" size="20px" />
        <span>{{ currentLangLabel }}</span>
      </div>
    </template>

    <q-list class="lang-list">
      <q-item-label header class="menu-header-label">
        {{ $t("common.language") || 'Idioma' }}
      </q-item-label>
      <q-item
        v-for="lang in languages"
        :key="lang.value"
        clickable
        v-close-popup
        :active="locale === lang.value"
        class="lang-item"
        active-class="lang-active"
        @click="setLang(lang.value)"
      >
        <q-item-section avatar>
          <div class="lang-avatar" :class="{ 'is-active': locale === lang.value }">
            {{ lang.code }}
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="lang-name">{{ lang.label }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="locale === lang.value">
          <q-icon name="check" color="primary" size="xs" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const languages = [
  { label: "Espanol", value: "es-ES", code: "ES" },
  { label: "English", value: "en-US", code: "EN" },
];

const currentLangLabel = computed(() =>
  locale.value === "es-ES" ? "ES" : "EN",
);

function setLang(val) {
  locale.value = val;
  localStorage.setItem("edugami_lang", val);
}
</script>

<style scoped lang="scss">
.lang-switcher {
  color: var(--color-text-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
  }
}

.lang-label {
  align-items: center;
  display: flex;
  gap: var(--space-1);

  span {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0;
  }
}

.lang-list {
  min-width: 180px;
  padding: 0 !important;
}

.lang-item {
  border-radius: var(--radius-lg);
  margin: 0 var(--space-2) var(--space-1);
  padding: var(--space-2) var(--space-3) !important;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.06);
    transform: translateX(2px);
  }
}

.lang-avatar {
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  display: flex;
  font-size: 10px;
  font-weight: 800;
  height: 28px;
  justify-content: center;
  transition: var(--transition-fast);
  width: 28px;

  &.is-active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }
}

.lang-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.lang-active {
  background: rgba(79, 70, 229, 0.04) !important;
}
</style>
