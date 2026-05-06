<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    mask="####-##-##"
    placeholder="YYYY-MM-DD"
    outlined
    dense
    clearable
    class="app-date-field"
    :rules="rules"
    @update:model-value="updateValue"
    @clear="updateValue('')"
  >
    <template #prepend>
      <q-icon name="event" size="18px" />
    </template>

    <template #append>
      <q-icon name="calendar_month" size="18px" class="cursor-pointer">
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
          class="app-date-popup"
        >
          <q-date
            :model-value="modelValue"
            mask="YYYY-MM-DD"
            minimal
            @update:model-value="updateValue"
          >
            <div class="row items-center justify-end q-pa-sm">
              <q-btn v-close-popup flat color="primary" label="OK" no-caps />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  rules: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

function updateValue(value) {
  emit("update:modelValue", value || "");
}
</script>

<style scoped lang="scss">
.app-date-field :deep(.q-field__append .q-icon) {
  color: var(--color-primary);
}

:global(.app-date-popup) {
  border-radius: var(--tenant-radius-md, var(--radius-xl));
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

:global(.app-date-popup .q-date) {
  background: var(--color-surface-strong);
  color: var(--color-text-primary);
}
</style>
