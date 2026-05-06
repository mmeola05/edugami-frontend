import { useQuasar } from "quasar";

export function useConfirmDialog() {
  const $q = useQuasar();

  function confirmAction({
    title = "Confirmar accion",
    message = "Esta accion puede tener impacto en la plataforma.",
    okLabel = "Confirmar",
    cancelLabel = "Cancelar",
    color = "negative",
    icon = "priority_high",
  }) {
    return new Promise((resolve) => {
      $q.dialog({
        class: "app-confirm-dialog",
        title,
        message: `
          <div class="app-confirm-body">
            <div class="app-confirm-icon app-confirm-icon--${color}">
              <i class="material-icons">${icon}</i>
            </div>
            <div class="app-confirm-copy">${message}</div>
          </div>
        `,
        html: true,
        ok: {
          label: okLabel,
          color,
          unelevated: true,
          noCaps: true,
        },
        cancel: {
          label: cancelLabel,
          flat: true,
          noCaps: true,
        },
        persistent: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false));
    });
  }

  return { confirmAction };
}
