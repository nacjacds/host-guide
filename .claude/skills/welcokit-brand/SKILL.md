# WelcoKit Brand & Design System

## Identidad de marca

**Producto:** WelcoKit — guía digital inteligente para huéspedes de alojamientos turísticos  
**Dominio:** welcokit.com  
**Tagline ES:** "Todo lo que tus huéspedes necesitan saber, en un solo lugar"  
**Tagline EN:** "Everything your guests need to know, in one place"  
**Tono:** Cálido, profesional, moderno. Nunca frío ni corporativo. Tuteo en español.

---

## Logo

### Archivos disponibles
- `logo.svg` — logo completo color (símbolo naranja + texto azul) — uso principal en web
- `logo-white.svg` — logo completo blanco — uso en fondos oscuros (sidebar, emails, hero)
- `favicon.ico` — solo símbolo — uso en browser tab, app icon

### Estructura del logo
- **Símbolo:** caja abierta bajo tejado de casa — color `#FF4200` (naranja vibrante)
- **Tipografía:** tipografía serif personalizada — color `#1B4F72` (azul pizarra)
- **ViewBox:** `0 0 147.1 64.8` — respetar proporciones siempre

### Uso correcto
```html
<!-- Logo principal (fondos claros) -->
<img src="/logo.svg" alt="WelcoKit" height="32" />

<!-- Logo blanco (fondos oscuros) -->
<img src="/logo-white.svg" alt="WelcoKit" height="32" />
```

### Tamaños mínimos
- Web desktop: 120px de ancho mínimo
- Web móvil: 100px de ancho mínimo
- Nunca mostrar el logo a menos de 80px de ancho

### Espacio de respeto
Mantener un margen mínimo equivalente a la altura de la letra "W" en todos los lados del logo.

### Lo que NO hacer
- No cambiar los colores del logo
- No estirar ni deformar las proporciones
- No añadir sombras ni efectos
- No usar el logo sobre fondos que no sean blancos, crema, o el azul primario

---

## Paleta de colores

### Colores principales

| Nombre | Hex | Uso |
|--------|-----|-----|
| Azul pizarra | `#1B4F72` | Color primario — sidebar, headers, navegación, texto de marca |
| Naranja vibrante | `#FF4200` | Acento 2 — botones CTA principales, highlights, símbolo del logo |
| Terracota | `#C0603A` | Acento 1 — badges, elementos decorativos, iconos secundarios |

### Colores de superficie

| Nombre | Hex | Uso |
|--------|-----|-----|
| Crema | `#FAFAF8` | Fondo principal de la app |
| Arena | `#F5EFE6` | Superficie de cards, paneles secundarios |
| Blanco | `#FFFFFF` | Cards, modales, inputs |

### Colores de texto

| Nombre | Hex | Uso |
|--------|-----|-----|
| Casi negro | `#1A1A18` | Texto principal |
| Gris cálido | `#6B6B67` | Texto secundario, placeholders, captions |
| Gris claro | `#DDD8CC` | Bordes, separadores |

### Variables CSS — globals.css
```css
:root {
  /* Marca */
  --color-primary: #1B4F72;
  --color-accent-orange: #FF4200;
  --color-accent-terra: #C0603A;
  
  /* Superficies */
  --color-bg: #FAFAF8;
  --color-surface: #F5EFE6;
  --color-white: #FFFFFF;
  
  /* Texto */
  --color-text: #1A1A18;
  --color-text-secondary: #6B6B67;
  --color-border: #DDD8CC;
  
  /* Semánticos */
  --color-cta: #FF4200;        /* botones principales */
  --color-nav: #1B4F72;        /* sidebar y navegación */
  --color-warm: #C0603A;       /* elementos cálidos */
}
```

### Uso del color en botones
```
Botón primario (CTA):    fondo #FF4200, texto blanco
Botón secundario:        fondo transparente, borde #1B4F72, texto #1B4F72
Botón destructivo:       fondo #EF4444, texto blanco
Botón ghost:             fondo transparente, texto #6B6B67
```

---

## Tipografía

### Familias tipográficas
- **Playfair Display** — títulos principales, nombre del alojamiento en la guía pública
- **Inter** — todo el resto: UI, cuerpo de texto, labels, formularios

```css
/* Importar en layout.tsx o globals.css */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
```

### Escala tipográfica

| Elemento | Familia | Peso | Tamaño |
|----------|---------|------|--------|
| Título hero (guía) | Playfair Display | 700 | 28px móvil / 36px desktop |
| Título de sección | Playfair Display | 600 | 22px |
| Heading dashboard | Inter | 600 | 20px |
| Subheading | Inter | 500 | 16px |
| Cuerpo | Inter | 400 | 14-16px |
| Caption / label | Inter | 400 | 12px |
| Micro | Inter | 400 | 11px mínimo |

---

## Iconografía

### Librería: Lucide React
Ya instalada en el proyecto. Usar siempre iconos **line-style** con `strokeWidth={1.5}`.

```tsx
import { Wifi, KeyRound, DoorOpen, ScrollText } from 'lucide-react'

// Tamaños estándar
<Wifi size={24} strokeWidth={1.5} />        // tiles de la guía
<Wifi size={16} strokeWidth={1.5} />        // UI interna
```

### Mapeo de bloques a iconos Lucide

| Bloque | Icono |
|--------|-------|
| wifi | `Wifi` |
| checkin | `KeyRound` |
| checkout | `DoorOpen` |
| rules | `ScrollText` |
| parking | `ParkingSquare` |
| appliances | `Plug` |
| pool | `Waves` |
| emergencies | `ShieldAlert` |
| restaurants | `UtensilsCrossed` |
| drinks | `Wine` |
| nightlife | `Music` |
| attractions | `Landmark` |
| recommendations | `MapPin` |
| custom | `FileText` |

### Color de iconos
- Iconos en tiles de guía pública: `accent_color` de la propiedad (default `#1B4F72`)
- Iconos en UI del dashboard: `#6B6B67` (gris cálido)
- Iconos en botones: heredan el color del texto del botón

---

## Componentes base

### Botón primario (CTA)
```tsx
<button className="bg-[#FF4200] text-white font-medium px-6 py-3 rounded-xl 
  hover:bg-[#e03a00] transition-colors">
  Crear cuenta
</button>
```

### Botón secundario
```tsx
<button className="border border-[#1B4F72] text-[#1B4F72] font-medium px-6 py-3 
  rounded-xl hover:bg-[#1B4F72]/5 transition-colors">
  Ver guía
</button>
```

### Card estándar
```tsx
<div className="bg-white border border-[#DDD8CC] rounded-2xl p-6 shadow-sm 
  hover:shadow-md transition-shadow">
  {/* contenido */}
</div>
```

### Badge de estado
```tsx
// Publicada
<span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
  Publicada
</span>

// Borrador  
<span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
  Borrador
</span>

// Plan badge
<span className="bg-[#FF4200] text-white text-xs font-medium px-2.5 py-1 rounded-full">
  Pro
</span>
```

### Input estándar
```tsx
<input className="w-full border border-[#DDD8CC] rounded-xl px-4 py-3 text-[#1A1A18] 
  placeholder:text-[#6B6B67] focus:outline-none focus:border-[#1B4F72] 
  focus:ring-1 focus:ring-[#1B4F72] transition-colors" />
```

---

## Espaciado y layout

### Border radius
- Inputs, botones pequeños: `rounded-xl` (12px)
- Cards, paneles: `rounded-2xl` (16px)
- Hero, imágenes grandes: `rounded-3xl` (24px)
- Pills, badges: `rounded-full`

### Sombras
- Reposo: `shadow-sm`
- Hover: `shadow-md`
- Modal: `shadow-xl`
- Nunca usar `shadow-2xl` o superiores

### Espaciado interno (padding)
- Cards: `p-6` (24px)
- Secciones: `p-8` (32px)
- Modales: `p-6 md:p-8`
- Botones: `px-6 py-3`

---

## Tono de comunicación

### En la interfaz del anfitrión
- Tuteo siempre en español
- Lenguaje directo y sin tecnicismos
- Mensajes de error: explicar qué pasó y qué hacer, nunca solo el código de error
- Mensajes de éxito: celebrar brevemente ("¡Guía publicada!")

### En la guía pública (para huéspedes)
- Tono del anfitrión (configurable: cercano o formal)
- Siempre claro y útil
- Traducciones en inglés: natural, no literal

### En emails (Resend)
- Asunto: directo, sin clickbait
- Remitente: "WelcoKit <hola@welcokit.com>"
- Firma: logo blanco sobre fondo `#1B4F72`
- CTA principal: botón naranja `#FF4200`

---

## Landing page (welcokit.com)

### Estructura de secciones
1. **Hero** — tagline + CTA "Empieza gratis" + demo visual
2. **Problema** — "¿Cuántas veces respondes las mismas preguntas?"
3. **Solución** — cómo funciona en 3 pasos
4. **Features** — guía digital, IA, multiidioma, WhatsApp, reservas
5. **Precios** — tabla de planes (free/starter/pro/agency)
6. **Testimonios** — cuando los haya
7. **CTA final** — "Crea tu primera guía gratis"
8. **Footer** — logo blanco, links, copyright

### Colores en landing
- Hero background: `#1B4F72` con logo blanco
- Secciones alternas: `#FAFAF8` y `#F5EFE6`
- CTAs: `#FF4200`
- Texto sobre fondo oscuro: blanco

---

## Assets en el proyecto

Copiar en `/public/`:
- `logo.svg` — logo color principal
- `logo-white.svg` — logo blanco
- `favicon.ico` — favicon
- `og-image.png` — 1200x630px para Open Graph (crear)

### Meta tags estándar
```tsx
// app/layout.tsx
export const metadata = {
  title: 'WelcoKit — Todo lo que tus huéspedes necesitan saber, en un solo lugar',
  description: 'Crea guías digitales inteligentes para tus huéspedes. Con IA, multiidioma, QR WiFi y más.',
  openGraph: {
    title: 'WelcoKit',
    description: 'Todo lo que tus huéspedes necesitan saber, en un solo lugar',
    url: 'https://welcokit.com',
    siteName: 'WelcoKit',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WelcoKit',
    description: 'Todo lo que tus huéspedes necesitan saber, en un solo lugar',
  },
}
```
