<template>
  <app-dialog
    v-model="show"
    :title="isEditing ? $t('tenants.dialog_edit_title') : $t('tenants.dialog_new_title')"
    :subtitle="$t('tenants.dialog_subtitle')"
    :icon="isEditing ? 'settings_suggest' : 'rocket_launch'"
    wide
  >
    <q-form id="tenant-form" @submit="$emit('save')">
      <div class="form-grid">
            <div class="field-span">
              <div class="luxury-input-wrapper">
                <div class="label-row">
                  <q-icon name="business" size="14px" color="primary" />
                  <label class="luxury-label">{{ $t("tenants.form_name") }}</label>
                </div>
                <q-input
                  v-model="form.name"
                  :placeholder="$t('tenants.form_name_placeholder')"
                  outlined
                  dense
                  class="luxury-field"
                  :rules="[(val) => !!val || $t('rules.required')]"
                />
              </div>
            </div>

            <div>
              <div class="luxury-input-wrapper">
                <div class="label-row">
                  <q-icon name="alternate_email" size="14px" color="primary" />
                  <label class="luxury-label">{{ $t("tenants.form_slug") }}</label>
                </div>
                <q-input
                  v-model="form.slug"
                  :placeholder="$t('tenants.form_slug_placeholder')"
                  outlined
                  dense
                  class="luxury-field"
                  :rules="[(val) => !!val || $t('rules.required')]"
                />
              </div>
            </div>

            <div>
              <div class="luxury-input-wrapper">
                <div class="label-row">
                  <q-icon name="category" size="14px" color="primary" />
                  <label class="luxury-label">{{ $t("tenants.form_type") }}</label>
                </div>
                <q-select
                  v-model="form.tenantType"
                  :options="typeOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="luxury-field"
                />
              </div>
            </div>

            <div class="field-span">
              <div class="luxury-input-wrapper">
                <div class="label-row">
                  <q-icon name="public" size="14px" color="primary" />
                  <label class="luxury-label">{{ $t("tenants.form_region") }}</label>
                </div>
                <q-select
                  v-model="form.timezone"
                  :options="timezoneOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="luxury-field"
                />
              </div>
            </div>
      </div>
    </q-form>

    <template #actions>
      <q-btn
        flat
        :label="$t('common.cancel')"
        color="grey-7"
        @click="show = false"
        no-caps
        class="cancel-btn"
      />
      <q-btn
        unelevated
        color="primary"
        :label="isEditing ? $t('tenants.save_btn') : $t('tenants.confirm_btn')"
        class="btn-premium-large"
        :loading="saving"
        no-caps
        type="submit"
        form="tenant-form"
      />
    </template>
  </app-dialog>
</template>

<script setup>
import { computed } from "vue";
import AppDialog from "components/common/AppDialog.vue";

const props = defineProps({
  modelValue: Boolean,
  isEditing: Boolean,
  form: Object,
  typeOptions: Array,
  timezoneOptions: Array,
  saving: Boolean,
});

const emit = defineEmits(["update:modelValue", "save"]);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped lang="scss">
.label-row {
  align-items: center;
  display: flex;
}

.form-grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-span {
  grid-column: 1 / -1;
}

.luxury-input-wrapper {
  display: grid;
  gap: var(--space-2);
}

.label-row {
  gap: var(--space-1);
}

.luxury-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
}

.luxury-field {
  :deep(.q-field__control) {
    background: var(--color-bg-secondary) !important;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg) !important;
    transition: var(--transition-color);

    &::before {
      border: none !important;
    }

    &:hover {
      border-color: var(--color-border-default);
    }

    &.q-field__control--focused {
      border-color: var(--color-primary) !important;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
  }
}

.cancel-btn,
.btn-premium-large {
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-bold);
}

.btn-premium-large {
  background: var(--gradient-primary) !important;
  box-shadow: var(--shadow-glow);
  color: #f7fbff;
  font-size: var(--font-size-sm);
  letter-spacing: 0;
  padding: var(--space-3) var(--space-8);
  transition: var(--transition-fast);

  &:hover {
    transform: translate3d(0, -2px, 0);
  }
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
