# EDUGAMI Premium UI Brand Book

Guia tecnica de referencia para diseno y desarrollo del sistema premium de EDUGAMI. Este documento traduce los tokens de [global-variables.scss](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/src/css/global-variables.scss) y las utilidades de [app.scss](/c:/Users/marcm/Documents/VUE/Edugami/edugami-root-suite/edugami-frontend/src/css/app.scss) en reglas de uso concretas para el equipo.

## 1. Filosofia de Diseno y Paz Visual

EDUGAMI busca una interfaz moderna, limpia y sofisticada. La sensacion visual debe ser calmada, precisa y segura: nada grita, todo guia. La jerarquia se construye con contraste medido, peso tipografico, espaciado constante y superficies con profundidad sutil.

La paz visual en este sistema significa:

- usar pocos niveles de enfasis por pantalla
- evitar blancos y negros puros
- dejar respirar a los bloques con gaps sistemicos
- dar protagonismo al contenido, no al decorado
- reservar gradientes, glow y color intenso para momentos de accion o estado

### Reglas de oro

1. La escala tipografica sigue una proporcion 1.25.
2. El espaciado base es de 4px, representado por `--space-1: 0.25rem`.
3. El tamano no sustituye a la importancia: antes de subir un `font-size`, sube `font-weight`.
4. Ningun componente debe introducir numeros magicos si ya existe un token equivalente.
5. Toda nueva pieza debe verse bien en claro y en oscuro desde el primer commit.

### Escala tipografica oficial

| Token | Valor | Uso recomendado |
| --- | --- | --- |
| `--font-size-xs` | 12px | caption, labels secundarias |
| `--font-size-sm` | 14px | metadata, supporting text |
| `--font-size-base` | 16px | body principal |
| `--font-size-lg` | 20px | subtitulos, mini headings |
| `--font-size-xl` | 25px | heading seccion |
| `--font-size-2xl` | 31px | heading principal de pagina |
| `--font-size-3xl` | 39px | hero o cabecera excepcional |

### Escala de espaciado oficial

| Token | Valor | Uso recomendado |
| --- | --- | --- |
| `--space-1` | 4px | micro-ajustes, icono + texto |
| `--space-2` | 8px | grupos compactos |
| `--space-3` | 12px | labels y controles |
| `--space-4` | 16px | unidad base de composicion |
| `--space-5` | 20px | formularios comodos |
| `--space-6` | 24px | cards, bloques, listas premium |
| `--space-8` | 32px | separacion entre modulos |
| `--space-10` | 40px | cabeceras de seccion |
| `--space-12` | 48px | layout principal |
| `--space-16` | 64px | respiracion de landing o hero |

## 2. Paleta de Colores Dinamica

El sistema separa fondo, superficie, texto, borde y acentos. La prioridad no es "meter color", sino mantener lectura y profundidad sin ruido.

### Fondos base por modo

| Rol | Light | Dark | Uso |
| --- | --- | --- | --- |
| `--color-bg-primary` | `#f7f4ef` | `#07111f` | lienzo principal de pagina |
| `--color-bg-secondary` | `#ede8df` | `#0d1a2b` | bloques elevados o zonas de agrupacion |
| `--color-bg-tertiary` | `#e3ded4` | `#14243a` | contenedores auxiliares, filtros, panels secundarios |
| `--color-surface` | `rgba(253,250,244,.86)` | `rgba(13,26,43,.72)` | glass, cards, overlays |
| `--color-surface-strong` | `#fdfaf4` | `#101f32` | inputs, controles, areas de lectura |

### Regla de uso de `bg-primary`, `bg-secondary` y `bg-tertiary`

- Usa `bg-primary` cuando quieras el fondo general de la experiencia.
- Usa `bg-secondary` para separar una region completa del resto sin convertirla en protagonista.
- Usa `bg-tertiary` para elementos de soporte: toolbars internas, filtros, summaries, panels secundarios.

En este sistema no conviene saltar directamente de `bg-primary` a bordes fuertes. Primero sube un nivel de superficie; despues, si hace falta, agrega borde.

### Texto y bordes

| Token | Uso |
| --- | --- |
| `--color-text-primary` | titulos y contenido critico |
| `--color-text-secondary` | descripciones, labels, hints |
| `--color-text-tertiary` | metadata, iconografia de apoyo |
| `--color-border-subtle` | divisiones suaves |
| `--color-border-default` | foco visual y separacion estandar |

### Acentos y semanticos

| Token | Light intent | Dark intent | Uso |
| --- | --- | --- | --- |
| `--color-primary` | accion principal | accion principal | CTA, links premium, foco |
| `--color-secondary` | acento editorial | acento editorial | pestanas, badges especiales |
| `--color-accent` | acento tecnico | acento tecnico | highlights, visualizaciones, micro-datos |
| `--color-success` | confirmacion | confirmacion | estados positivos, health |
| `--color-warning` | atencion | atencion | riesgos medios o pendientes |
| `--color-error` | error | error | fallos, bloqueos, peligro |
| `--color-info` | contexto | contexto | ayuda, paneles explicativos |

### Regla cromatica clave

Nunca uses blanco puro `#ffffff` ni negro puro `#000000` como base visual del producto. Si necesitas contraste, usa:

```scss
color: var(--color-text-primary);
background: var(--color-surface-strong);
border: 1px solid var(--color-border-default);
```

### Ejemplo de superficie correcta

```html
<section class="card">
  <p class="text-sm text-secondary">Resumen</p>
  <h2 class="text-2xl font-extrabold">Panel operativo</h2>
</section>
```

```scss
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-default);
}
```

## 3. Componentes Maestros

### Cards

La card premium es el contenedor base del producto. Debe sentirse estable, suave y util. En EDUGAMI una card no es una caja neutra: es una superficie con jerarquia.

#### Especificacion base

- Fondo: `var(--color-surface)`
- Borde: `1px solid var(--color-border-subtle)`
- Radio recomendado: `var(--radius-xl)` = 16px
- Padding recomendado: `var(--space-6)` = 24px
- Sombra base: `var(--shadow-default)`
- Hover por defecto: elevacion a `var(--shadow-lg)` y `translate3d(0, -3px, 0)`

#### Cuando usar `.card-interactive`

Usa `.card-interactive` solo cuando toda la superficie sea clicable o haya un patron tipo selector, navegado o resumen expandible. No la uses en cards con muchos botones internos si eso puede confundir la accion principal.

```html
<article class="card card-interactive animate-entrance" tabindex="0">
  <p class="text-sm text-secondary mb-2">Tenant</p>
  <h3 class="text-xl font-bold mb-3">Colegio Norte</h3>
  <p class="text-base text-secondary">Estado estable y sincronizacion correcta.</p>
</article>
```

#### Patron recomendado

```html
<article class="card flex flex-col gap-4">
  <header class="flex items-start justify-between gap-4">
    <div>
      <p class="text-sm text-secondary">Categoria</p>
      <h3 class="text-xl font-bold">Titulo de card</h3>
    </div>
    <span class="badge badge-success">Healthy</span>
  </header>

  <p class="text-base text-secondary">
    Una card premium resume informacion, no la comprime.
  </p>
</article>
```

### Tipografia

La jerarquia se apoya mas en el peso y el color que en tamanos exagerados. El sistema ya define clases y tokens suficientes para que una pantalla se lea bien a simple vista.

#### Tabla de jerarquias

| Rol | Clase/tokens recomendados | Regla |
| --- | --- | --- |
| H1 de pagina | `.text-2xl.font-extrabold.leading-tight` | usar solo una vez por pagina |
| H2 de seccion | `.text-xl.font-bold.leading-tight` | separar bloques principales |
| H3 de card | `.text-lg.font-semibold.leading-tight` o heading nativo | mantenerlo compacto |
| Body principal | `.text-base` | lectura normal |
| Body secundario | `.text-base.text-secondary` | explicacion, contexto |
| Caption | `.text-xs.font-semibold.text-secondary` | metadata y labels |

#### Patron recomendado de bloque textual

```html
<div class="flex flex-col gap-2">
  <p class="text-xs font-semibold text-secondary">Sistema</p>
  <h1 class="text-2xl font-extrabold leading-tight">Root Dashboard</h1>
  <p class="text-base text-secondary">
    Visibilidad operativa, alertas y control de servicios en una sola capa.
  </p>
</div>
```

### Tablas y listas

El objetivo no es meter mas columnas, sino exponer patron. Una tabla premium:

- usa ritmo vertical regular
- evita ruido de borde por cada celda
- reserva color fuerte para estado y accion
- usa texto secundario para metadata
- no desperdicia ancho con paddings arbitrarios

#### Reglas practicas

- Padding de celda: entre `--space-3` y `--space-4`
- Cabecera: `font-weight: 600`, color secundario, fondo solo si mejora la lectura
- Primera columna: la mas informativa
- Estados: mediante `badge` o color semantico, no con bloques chillones

```html
<div class="card p-0">
  <div class="flex items-center justify-between p-6">
    <h3 class="text-lg font-semibold">Servicios</h3>
    <span class="badge badge-primary">5 activos</span>
  </div>

  <table class="w-full">
    <thead>
      <tr>
        <th class="text-left text-xs font-semibold text-secondary">Servicio</th>
        <th class="text-left text-xs font-semibold text-secondary">Estado</th>
        <th class="text-left text-xs font-semibold text-secondary">Canal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>platform-api</td>
        <td><span class="badge badge-success">Up</span></td>
        <td class="text-secondary">ops-agent</td>
      </tr>
    </tbody>
  </table>
</div>
```

```scss
th,
td {
  padding: var(--space-3) var(--space-6);
}

tbody tr + tr td {
  border-top: 1px solid var(--color-border-subtle);
}
```

### Botones y formularios

Los CTAs deben sentirse firmes, no voluminosos. El radio permitido vive entre 12px y 16px, ya cubierto por `--radius-lg` y `--radius-xl`.

#### Botones

- Primario: `.btn.btn-primary` o `.btn-premium`
- Secundario: `.btn.btn-secondary`
- Outline: `.btn.btn-outline`
- Ghost: `.btn.btn-ghost`

#### Estados obligatorios

- `hover`: subir ligeramente y reforzar sombra
- `active`: volver a la posicion base
- `focus-visible`: anillo visible
- `disabled`: reducir contraste y eliminar transform

```html
<div class="flex items-center gap-3">
  <button class="btn btn-primary">Guardar cambios</button>
  <button class="btn btn-outline">Cancelar</button>
</div>
```

```scss
.btn {
  border-radius: var(--radius-lg);
  transition: var(--transition-fast);
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
}
```

#### Formularios

- Fondo: `var(--color-surface-strong)`
- Borde base: `var(--color-border-subtle)`
- Focus: color primario + halo de 3px
- Padding recomendado: `--space-3` vertical, `--space-4` horizontal

```html
<label class="form-label" for="email">Email corporativo</label>
<input id="email" class="form-input" type="email" placeholder="nombre@edugami.com" />
```

```scss
.form-input {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.14);
}
```

## 4. Layout y Espaciado

El layout debe respirar incluso cuando contiene mucha informacion. La regla base es construir en capas: pagina, seccion, componente, detalle.

### Contenedores

- Usa `.container` para pantallas de contenido con ancho controlado.
- Usa `padding` de pagina entre `--space-4` y `--space-8` segun densidad.
- Evita wrappers innecesarios si una `card` ya resuelve borde, fondo y respiracion.

### Gaps recomendados

| Contexto | Gap |
| --- | --- |
| icono + label | `gap-2` |
| bloque compacto | `gap-3` |
| formulario o stack normal | `gap-4` |
| card premium | `gap-6` |
| secciones de dashboard | `gap-8` |

### Grid

Para dashboards y listados, prioriza `grid` con columnas responsivas antes que margenes manuales.

```html
<section class="container">
  <div class="grid gap-6 dashboard-grid">
    <article class="card">Resumen</article>
    <article class="card">Alertas</article>
    <article class="card">Servicios</article>
  </div>
</section>
```

```scss
.dashboard-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

### Regla de mantenimiento SCSS

No crear archivos SCSS por pagina salvo que la pagina necesite una composicion excepcional que no pueda expresarse con las clases globales y un `style scoped` pequeno.

Prioridad de implementacion:

1. Tokens globales de `global-variables.scss`
2. Utilidades y componentes compartidos de `app.scss`
3. `style scoped` local y breve

Evitar:

```scss
.page-x .card-y .title-z {
  margin-top: 19px;
  color: #545d6d;
}
```

Preferir:

```html
<h3 class="text-lg font-semibold text-secondary mt-4">Actividad reciente</h3>
```

## 5. Animaciones y Micro-interacciones

Las animaciones deben reforzar orientacion y calidad percibida, nunca distraer. La clase recomendada de entrada comun es `.animate-entrance`, que ya mapea al patron `slideUpFade`.

### Uso de `.animate-entrance`

- entrada de cards al montar
- paneles laterales o bloques de formulario
- modulos nuevos que necesitan aparecer con suavidad

No la uses repetidamente en listas enormes ni para elementos que cambian cada pocos milisegundos.

```html
<section class="card animate-entrance">
  <h3 class="text-lg font-semibold mb-3">Nueva actividad</h3>
  <p class="text-secondary">El contenido aparece con una subida suave y opacidad.</p>
</section>
```

### Especificacion tecnica obligatoria

- animar solo `transform` y `opacity`
- evitar animar `width`, `height`, `top`, `left` o sombras enormes frame a frame
- usar `translate3d(...)` para favorecer compositing
- mantener duracion base en `--duration-base` salvo casos justificados

```scss
@keyframes entrance {
  from {
    opacity: 0;
    transform: translate3d(0, 16px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-entrance {
  animation: entrance var(--duration-base) var(--ease-out) both;
  will-change: transform, opacity;
}
```

## 6. Checklist de Calidad UI

Antes de cerrar un componente, el desarrollador debe confirmar:

1. La jerarquia tipografica sigue la escala y no depende de tamanos desproporcionados.
2. El espaciado usa tokens del sistema y mantiene respiracion consistente entre bloques.
3. El componente funciona en modo claro y modo oscuro sin colores hardcodeados.
4. Los estados interactivos existen: hover, focus-visible, active y disabled cuando aplica.
5. El componente reutiliza clases globales o `style scoped` minimo, sin crear deuda visual local.

## Patrones de referencia

### Ejemplo completo de card premium

```html
<article class="card card-interactive animate-entrance flex flex-col gap-6" tabindex="0">
  <header class="flex items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-secondary">Infraestructura</p>
      <h3 class="text-xl font-bold leading-tight">Estado de servicios</h3>
    </div>
    <span class="badge badge-success">Operativo</span>
  </header>

  <p class="text-base text-secondary">
    Todos los procesos criticos responden dentro del umbral esperado.
  </p>

  <footer class="flex items-center justify-between gap-4">
    <span class="text-sm text-secondary">Actualizado hace 2 min</span>
    <button class="btn btn-outline">Ver detalle</button>
  </footer>
</article>
```

### Ejemplo de layout de formulario

```html
<section class="container">
  <div class="card flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-secondary">Acceso</p>
      <h2 class="text-xl font-bold">Credenciales de plataforma</h2>
    </div>

    <div class="grid gap-4 form-grid">
      <div>
        <label class="form-label" for="user">Usuario</label>
        <input id="user" class="form-input" type="text" />
      </div>
      <div>
        <label class="form-label" for="password">Password</label>
        <input id="password" class="form-input" type="password" />
      </div>
    </div>

    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-secondary">Las credenciales se validan en tiempo real.</p>
      <button class="btn btn-primary">Guardar</button>
    </div>
  </div>
</section>
```

```scss
.form-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
```

## Cierre

EDUGAMI no necesita una UI cargada para verse premium. Necesita consistencia, profundidad sutil y decisiones repetibles. Si un componente respeta tokens, jerarquia, respiracion y estados, ya esta hablando el lenguaje de la marca.
