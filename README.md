# Edugami Frontend

Frontend Quasar de EDUGAMI con sistema de diseno premium centralizado.

## Documentacion que se mantiene

Solo se conservan estos documentos:

- [README.md](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/README.md): entrada rapida del proyecto
- [BRAND_BOOK_PREMIUM_UI.md](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/BRAND_BOOK_PREMIUM_UI.md): guia completa de uso visual y de componentes
- [AUDIT_DESIGN_SYSTEM.md](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/AUDIT_DESIGN_SYSTEM.md): estado tecnico y reglas de arquitectura CSS

## Arquitectura CSS

El nucleo visual vive exclusivamente en:

```text
src/css/
|-- global-variables.scss
|-- app.scss
`-- quasar.variables.scss
```

Reglas:

- tokens globales: `global-variables.scss`
- clases globales reutilizables: `app.scss`
- integracion Quasar: `quasar.variables.scss`
- estilos unicos: dentro del `<style scoped lang="scss">` del componente

## Comandos

### Instalar dependencias

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Inicio rapido de diseño

### 1. Verifica tokens

Revisa:

- [global-variables.scss](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/src/css/global-variables.scss)
- [app.scss](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/src/css/app.scss)

### 2. Usa primitives del sistema

```vue
<template>
  <section class="page-shell-premium">
    <article class="card card-interactive animate-entrance">
      <p class="text-eyebrow">Sistema</p>
      <h1 class="text-page-title">Root Dashboard</h1>
      <p class="text-page-subtitle">Resumen operativo de plataforma</p>
    </article>
  </section>
</template>
```

### 3. Consulta la guía larga

Para reglas visuales completas:

- abre [BRAND_BOOK_PREMIUM_UI.md](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/BRAND_BOOK_PREMIUM_UI.md)

Para reglas de arquitectura CSS:

- abre [AUDIT_DESIGN_SYSTEM.md](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/AUDIT_DESIGN_SYSTEM.md)
