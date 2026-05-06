# Auditoria de Diseno - Estado Real del Frontend

## Executive Summary

La arquitectura de estilos del frontend ha sido normalizada. El sistema ya no depende de archivos SCSS por pagina ni de modulos visuales paralelos. El resultado actual es un design system compacto, centralizado y coherente con la regla de single source of truth.

## Estructura valida hoy

```text
src/css/
|-- global-variables.scss
|-- app.scss
`-- quasar.variables.scss
```

## Estructura eliminada

Estos archivos ya no forman parte de la arquitectura:

- `auth.scss`
- `dashboard-premium.scss`
- `tenants.scss`
- cualquier variante tipo `design-system-colors.scss`
- cualquier variante tipo `design-system-typography-spacing.scss`
- cualquier variante tipo `design-system-components.scss`

## Decision arquitectonica

### 1. Tokens

Todos los tokens globales viven en `global-variables.scss`.

Incluye:

- paleta dinamica light/dark
- escala tipografica 1.25
- spacing base 4px
- radios, sombras y transiciones

### 2. Primitives y helpers

Todo lo reusable vive en `app.scss`.

Incluye:

- reset
- tipografia base
- motion global
- cards, buttons, badges, forms
- helpers de layout y spacing
- clases de lenguaje visual no ligadas a una pagina

### 3. Singularidades

Todo estilo estrictamente unico vive en el `.vue` correspondiente bajo `style scoped`.

## Clases globales vigentes

### Shell y jerarquia

- `.page-shell-premium`
- `.text-page-title`
- `.text-page-subtitle`
- `.text-eyebrow`

### Componentes base

- `.card`
- `.card-premium`
- `.card-saas`
- `.card-interactive`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-premium`
- `.badge` y variantes
- `.form-input`, `.form-select`, `.form-textarea`, `.form-label`

### Utilidades visuales

- `.metric-card`
- `.metric-value`
- `.section-title`
- `.status-pill`, `.status-pill-sm`, `.status-pill__dot`, `.status-label`
- `.text-meta-mono`
- `.table-premium`

### Motion

- `.animate-fade-in`
- `.animate-slide-up`
- `.animate-slide-down`
- `.animate-scale-in`
- `.animate-entrance`
- `.animate-pulse`

## Hallazgos corregidos

### Antes

- documentacion describiendo archivos inexistentes
- clases como `text-dashboard-title` o `gateway-text` acopladas al contexto
- imports SCSS externos en vistas
- mezcla entre estilo de marca y parche por pagina

### Ahora

- documentacion alineada con el arbol real
- clases globales con naming proporcional y reusable
- vistas sin `@use` de archivos SCSS externos dedicados
- estilos unicos confinados al componente

## Patrones recomendados

### Reusable

```vue
<template>
  <div class="card">
    <p class="text-eyebrow">Insight</p>
    <h2 class="text-page-title">Estado global</h2>
    <p class="text-page-subtitle">Lectura operativa consolidada</p>
  </div>
</template>
```

### Unico

```vue
<style scoped lang="scss">
.hero-snapshot {
  min-height: 320px;
  background: radial-gradient(circle at top, rgba(79, 70, 229, 0.12), transparent 60%);
}
</style>
```

## Recomendacion operativa

Cada vez que se quiera introducir una nueva clase, aplicar esta decision:

1. Si sirve a mas de una pantalla, va a `app.scss`.
2. Si expresa un token, va a `global-variables.scss`.
3. Si es de una sola vista o componente, va a `style scoped`.

## Estado de cumplimiento

- `src/css/` nuclear: completo
- imports SCSS externos por vista: eliminados
- documentacion base alineada: completa
- arquitectura CSS fragmentada: resuelta
