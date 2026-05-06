<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
    :href="props.link"
    class="essential-link"
  >
    <q-item-section
      v-if="props.icon"
      avatar
    >
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption>{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },

  caption: {
    type: String,
    default: ''
  },

  link: {
    type: String,
    default: '#'
  },

  icon: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.essential-link {
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);
  }

  :deep(.q-item__label) {
    font-weight: var(--font-weight-semibold);
  }

  :deep(.q-item__label--caption) {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
  }
}
</style>
