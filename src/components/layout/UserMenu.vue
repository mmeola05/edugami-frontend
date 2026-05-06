<template>
  <div class="user-menu-wrapper">
    <q-btn flat no-caps class="user-btn">
      <div class="user-btn-content">
        <q-avatar size="32px" class="user-avatar">
          <img
            :src="getAvatarURL(userStore.user?.email)"
            :alt="userStore.user?.email || 'Avatar'"
          />
          <div class="status-indicator"></div>
        </q-avatar>
        <div class="user-copy hide-on-mobile">
          <div class="user-email">{{ userStore.user?.email || "Admin" }}</div>
          <div class="user-role">{{ userStore.user?.role || "ROOT" }}</div>
        </div>
        <q-icon name="expand_more" size="16px" class="chevron-icon" />
      </div>

      <q-menu
        transition-show="jump-down"
        transition-hide="jump-up"
        class="user-dropdown"
        content-class="premium-menu"
        anchor="bottom right"
        self="top right"
      >
        <div class="user-profile-card">
          <div class="user-info-header">
            <q-avatar size="52px" class="user-avatar-premium">
              <img
                :src="getAvatarURL(userStore.user?.email)"
                :alt="userStore.user?.email || 'Avatar'"
              />
            </q-avatar>
            <div class="user-meta-stack">
              <div class="user-info-title">
                {{ userStore.user?.role || "ROOT" }}
              </div>
              <div class="user-info-email">{{ userStore.user?.email }}</div>
            </div>
          </div>

          <div class="access-summary">
            <div class="stat-card">
              <div class="stat-icon">
                <q-icon name="extension" size="14px" />
              </div>
              <div class="stat-copy">
                <span>{{ $t("menu.modules") }}</span>
                <strong>{{ userStore.modules.length }}</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <q-icon name="admin_panel_settings" size="14px" />
              </div>
              <div class="stat-copy">
                <span>{{ $t("menu.rbac") }}</span>
                <strong>{{ permissionCount }}</strong>
              </div>
            </div>
          </div>
        </div>

        <q-list padding class="user-menu-list">
          <q-item
            v-if="userStore.hasModule('RBAC')"
            clickable
            v-ripple
            to="/root/rbac"
            v-close-popup
            class="menu-action-item"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Roles y permisos</q-item-label>
              <q-item-label caption>Gestionar accesos</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="userStore.hasModule('GLOBAL_MODULES')"
            clickable
            v-ripple
            to="/root/modules"
            v-close-popup
            class="menu-action-item"
          >
            <q-item-section avatar>
              <q-icon name="extension" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Catalogo de modulos</q-item-label>
              <q-item-label caption>Activacion global</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="confirmLogout" class="logout-item">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("auth.logout_btn") }}</q-item-label>
              <q-item-label caption>Cerrar sesion actual</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <app-dialog
      v-model="showLogoutDialog"
      :title="$t('auth.logout_confirm_title')"
      :subtitle="$t('auth.logout_confirm_msg')"
      icon="logout"
    >
      <div class="dialog-body">
        {{ $t("auth.logout_confirm_msg") }}
      </div>

      <template #actions>
          <q-btn
            flat
            :label="$t('common.cancel') || 'Cancelar'"
            color="grey"
            v-close-popup
          />
          <q-btn
            unelevated
            :label="$t('auth.logout_btn')"
            color="negative"
            class="btn-premium-red"
            @click="handleLogout"
          />
      </template>
    </app-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";
import { getAvatarURL } from "src/constants/assets.constants";
import AppDialog from "components/common/AppDialog.vue";

const userStore = useUserStore();
const router = useRouter();
const showLogoutDialog = ref(false);
const permissionCount = computed(() =>
  userStore.permissions.includes("*") ? "total" : userStore.permissions.length,
);

function confirmLogout() {
  showLogoutDialog.value = true;
}

async function handleLogout() {
  await userStore.logout();
  router.push("/auth/login");
}
</script>

<style scoped lang="scss">
.user-btn {
  border-radius: var(--radius-lg);
  padding: var(--space-1) var(--space-2);
  transition: var(--transition-fast);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
  }
}

.user-btn-content {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.user-avatar {
  border: 2px solid transparent;
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: var(--transition-fast);
}

.user-btn:hover .user-avatar {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.status-indicator {
  background: var(--color-success);
  border: 2px solid var(--color-surface-strong);
  border-radius: var(--radius-full);
  bottom: 0;
  height: 10px;
  position: absolute;
  right: 0;
  width: 10px;
}

.user-copy {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.user-email {
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: 1.1;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1.1;
}

.user-dropdown {
  min-width: 320px;
  padding: 0 !important;
}

.user-profile-card {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), transparent 60%);
  padding: var(--space-5) var(--space-4) var(--space-4);
}

.user-info-header {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.user-avatar-premium {
  border: 2px solid var(--color-surface-strong);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.12);
  transition: var(--transition-fast);
}

.user-meta-stack {
  display: flex;
  flex-direction: column;
}

.user-info-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.user-info-email {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.access-summary {
  display: flex;
  gap: var(--space-3);

  .stat-card {
    align-items: center;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    display: flex;
    flex: 1;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    transition: var(--transition-fast);

    &:hover {
      background: var(--color-surface-strong);
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }
  }

  .stat-icon {
    align-items: center;
    background: rgba(79, 70, 229, 0.1);
    border-radius: var(--radius-lg);
    color: var(--color-primary);
    display: flex;
    height: 36px;
    justify-content: center;
    width: 36px;
  }

  .stat-copy {
    display: flex;
    flex-direction: column;
  }

  span {
    color: var(--color-text-tertiary);
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-extrabold);
  }
}

.user-menu-list {
  border-top: 1px solid var(--color-border-subtle);
  padding: var(--space-2);
}

.menu-action-item {
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  margin-bottom: 2px;
  padding: var(--space-3);

  &:hover {
    background: rgba(79, 70, 229, 0.08);
    color: var(--color-primary);

    .q-icon {
      color: var(--color-primary);
      transform: scale(1.1);
    }
  }

  .q-icon {
    color: var(--color-text-tertiary);
    transition: var(--transition-fast);
  }
}

.logout-item {
  color: var(--color-error);
  margin-top: var(--space-2);

  &:hover {
    background: rgba(223, 70, 70, 0.08);
    color: var(--color-error);

    .q-icon {
      color: var(--color-error);
    }
  }
}

@media (max-width: 600px) {
  .hide-on-mobile {
    display: none;
  }
}
</style>
