# CLAUDE.md — WelcoKit

- **Dominio:** welcokit.com
- **Repositorio:** https://github.com/nacjacds/welcokit

## Visión del producto

Web app SaaS para anfitriones de alojamientos turísticos (Airbnb, Vrbo, Booking) que genera automáticamente una guía digital personalizada para sus huéspedes, con recomendaciones locales generadas por IA y un asistente de WhatsApp integrado.

**Propuesta de valor:** El anfitrión rellena su información una vez → la IA genera el contenido → el huésped accede vía QR o enlace sin instalar nada.

**Diferenciador clave vs competencia (Touch Stay, Hostfully, Maestro Host):**
- Recomendaciones locales generadas por IA (Google Places API + Claude), organizadas en bloques especializados (dónde comer, copas y bares, ocio nocturno, qué visitar) editables por el anfitrión
- Asistente de WhatsApp que responde preguntas del huésped usando el contenido de la guía como base de conocimiento
- Guía pública multiidioma (ES/EN) con traducción automática cacheada, sin coste recurrente por huésped
- Precio justo para el mercado español: plan básico 9€/mes, plan pro 24€/mes
- Sin complejidad de PMS — solo guía + IA + WhatsApp

---

## Stack técnico

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **IA:**
  - Anthropic Claude API — `claude-sonnet-4-6` para generación de contenido, recomendaciones y respuestas del bot
  - `claude-haiku-4-5-20251001` para traducción de la guía pública (20x más barato, resultado suficiente para textos cortos)
- **Recomendaciones locales:** Google Places API (Text Search + Place Details)
- **WhatsApp:** YCloud (WhatsApp Business API) + n8n para workflows
- **Iconos:** Lucide React (line-style, sin emojis en la guía pública)
- **Tipografía:** Playfair Display (serif, títulos) vía `next/font/google` + Inter (sans, cuerpo)
- **Deploy:** Vercel (frontend, dominio welcokit.com) + OVH VPS con EasyPanel (n8n self-hosted en ia.neurodatos.com)
- **Pagos:** Stripe (suscripciones mensuales)
- **Email transaccional:** Resend

---

## Estructura del proyecto

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout del panel del anfitrión
│   │   ├── dashboard/          # Vista principal con lista de propiedades
│   │   ├── properties/
│   │   │   ├── new/            # Crear nueva propiedad
│   │   │   └── [id]/
│   │   │       ├── edit/       # Editor de guía por bloques
│   │   │       └── settings/   # Config WhatsApp, color, idioma
│   │   ├── bookings/            # Reservas del anfitrión + compartir guía
│   │   └── account/            # Plan, facturación, perfil
│   ├── guide/
│   │   └── [slug]/             # Guía pública del huésped (sin auth)
│   │       ├── layout.tsx      # GuideLocaleProvider + WhatsApp FAB
│   │       ├── page.tsx        # Hero + grid de tiles
│   │       ├── [type]/         # Página de sección por tipo de bloque
│   │       └── recomendaciones/
│   └── api/
│       ├── bookings/               # Crear reserva + email de bienvenida automático
│       ├── properties/
│       │   └── [id]/
│       │       ├── blocks/         # Crear bloques (defaults por tipo)
│       │       ├── cover-image/    # Subida/borrado imagen de portada
│       │       ├── qr/             # QR de la URL de la guía
│       │       └── recommendations/
│       ├── guide-blocks/[id]/
│       │   └── images/             # Subida/borrado imágenes por bloque
│       ├── guide/
│       │   └── translate-content/  # Traducción ES→EN (títulos custom, descripciones de lugares)
│       ├── ai/
│       │   ├── generate-content/   # Genera borrador inicial con Claude
│       │   └── recommendations/    # Recomendaciones Google Places + Claude
│       ├── whatsapp/
│       │   └── webhook/            # Webhook de YCloud para mensajes entrantes
│       └── stripe/
│           └── webhook/
├── components/
│   ├── guide/                  # Componentes de la guía pública
│   │   ├── HeroSection.tsx         # Imagen de portada + gradiente + título Playfair
│   │   ├── GuideSectionHeader.tsx  # Header sticky compacto (icono grande + cover image)
│   │   ├── SectionHeading.tsx      # Icono Lucide 48px + título Playfair por sección
│   │   ├── TileGrid.tsx            # Grid de tiles (2 cols móvil / 3 desktop)
│   │   ├── TilePanel.tsx           # Render genérico de content (listas con Check icon)
│   │   ├── WifiPanel.tsx           # QR de conexión WiFi + estado "conectado"
│   │   ├── PlaceListPanel.tsx      # Cards de lugares (restaurants/drinks/nightlife/attractions)
│   │   ├── RecommendationsPanel.tsx
│   │   ├── EmergencyPanel.tsx
│   │   ├── BlockTitle.tsx          # Título traducido (custom) o estático (tipos conocidos)
│   │   ├── useTranslatedText.ts    # Hook compartido: llama a /api/guide/translate-content
│   │   ├── GuideLocaleProvider.tsx # Contexto ES/EN (localStorage) + propertyId
│   │   ├── LanguageSwitcher.tsx
│   │   ├── WhatsAppFab.tsx         # Pill flotante wa.me/ si whatsapp_number está configurado
│   │   └── BackToGuideButton.tsx
│   ├── editor/                 # Componentes del editor del anfitrión
│   │   ├── BlockEditor.tsx
│   │   ├── BlockToolbar.tsx        # Botones para crear cada tipo de bloque
│   │   ├── PublishPanel.tsx        # Publicar, imagen de portada, número de WhatsApp, QR, compartir guía
│   │   ├── blocks/
│   │   │   ├── WifiBlock.tsx
│   │   │   ├── CheckinBlock.tsx
│   │   │   ├── RulesBlock.tsx      # rules | parking | appliances | pool
│   │   │   ├── EmergencyBlock.tsx
│   │   │   ├── PlaceListBlock.tsx  # restaurants | drinks | nightlife | attractions
│   │   │   ├── RecommendationsBlock.tsx
│   │   │   └── CustomBlock.tsx
│   │   └── AIGenerateButton.tsx
│   ├── dashboard/
│   │   ├── ShareGuideDialog.tsx    # Panel compartir: mensaje copiable + enlace + QR (reservas y editor)
│   │   └── bookings/
│   │       ├── NewBookingDialog.tsx
│   │       └── BookingsList.tsx
│   └── ui/                     # Componentes genéricos (shadcn/ui)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts           # createClient() + createServiceRoleClient()
│   ├── claude.ts               # Cliente Claude API + generación + translateText (haiku)
│   ├── google-places.ts        # Cliente Google Places API
│   ├── guide-i18n.ts           # Diccionario ES/EN + getBlockTitle()
│   ├── guide-icons.tsx         # Mapeo BlockType → icono Lucide
│   ├── booking-message.ts      # Plantilla del mensaje de bienvenida (compartido cliente/servidor)
│   ├── qr.ts                   # QR de la URL pública de la guía (data URL para UI, Buffer para adjuntos de email)
│   ├── whatsapp/
│   │   ├── ycloud.ts           # Cliente YCloud
│   │   └── bot.ts              # Lógica del bot — build prompt + llamada Claude
│   └── utils.ts
├── supabase/
│   └── migrations/
└── n8n/
    └── workflows/
        └── whatsapp-bot.json   # Workflow n8n exportado
```

---

## Base de datos (Supabase)

### Tablas principales

```sql
-- Anfitriones (extendido de auth.users)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  full_name text,
  phone text,                      -- usado también como fallback del botón WhatsApp de la guía
  avatar_url text,                 -- bucket avatars, 200x200 webp, con cache-busting ?v=timestamp
  plan text DEFAULT 'free',        -- 'free' | 'starter' | 'pro' | 'agency' (ver lib/plans.ts)
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
)

-- Propiedades/alojamientos
properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES profiles(id),
  name text NOT NULL,              -- "Apartamento Triana"
  address text,
  slug text UNIQUE NOT NULL,       -- URL pública: /guide/apartamento-triana
  cover_image_url text,            -- bucket cover-images, con cache-busting ?v=timestamp
  accent_color text DEFAULT '#1B4F72',
  host_tone text DEFAULT 'friendly', -- 'friendly' | 'formal'
  language text DEFAULT 'es',
  whatsapp_number text,            -- Formato internacional sin '+' ni espacios (ej: 34600000000)
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Bloques de contenido de la guía
guide_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  type text NOT NULL,              -- ver lista completa de tipos abajo
  title text,                      -- solo se usa en la guía pública si type = 'custom'
  icon text,                       -- emoji, usado solo en el editor (la guía pública usa Lucide)
  content jsonb NOT NULL,          -- estructura específica por tipo de bloque
  images jsonb NOT NULL DEFAULT '[]', -- BlockImage[]: {url, alt, width, height, caption}
  order_index integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)
-- type IN (
--   'wifi', 'checkin', 'checkout', 'rules', 'parking', 'appliances', 'custom',
--   'emergencias', 'pool', 'restaurants', 'drinks', 'nightlife', 'attractions'
-- )

-- Recomendaciones locales generadas por IA (independiente de guide_blocks;
-- se muestran en /guide/[slug]/recomendaciones)
recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  category text NOT NULL,          -- 'restaurant' | 'bar' | 'supermarket' | 'pharmacy' | 'transport' | 'activity'
  name text NOT NULL,
  description text,                -- Generado por Claude, editable por anfitrión
  address text,
  google_place_id text,
  rating numeric(2,1),
  distance_meters integer,
  maps_url text,
  is_ai_generated boolean DEFAULT true,
  is_visible boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
)

-- Conversaciones del bot de WhatsApp
bot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  guest_phone text NOT NULL,
  messages jsonb DEFAULT '[]',     -- Array de {role, content, timestamp}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Caché global de traducciones de la guía pública (ver "Sistema de traducciones")
translations_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text_hash text NOT NULL,  -- md5(texto original)
  source_lang text NOT NULL DEFAULT 'es',
  target_lang text NOT NULL,
  translated_text text NOT NULL,
  created_at timestamptz DEFAULT now()
)
-- UNIQUE (source_text_hash, target_lang) — la caché es global entre anfitriones

-- Tickets de soporte in-app (widget flotante del dashboard, ver "Sistema de soporte")
support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,              -- 'bug' | 'feature_request' | 'question'
  subject text NOT NULL,
  description text NOT NULL,
  screenshot_url text,             -- bucket support-screenshots, opcional
  status text NOT NULL DEFAULT 'open', -- 'open' | 'closed'
  created_at timestamptz DEFAULT now()
)

-- Reservas de huéspedes (ver "Sistema de reservas y compartir guía")
bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  checkin_date date NOT NULL,
  checkout_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'completed'
  auto_email_enabled boolean NOT NULL DEFAULT true,
  welcome_email_sent_at timestamptz,       -- null hasta que el envío automático tiene éxito
  created_at timestamptz DEFAULT now()
)
```

### Bloques de "lista de lugares" (restaurants, drinks, nightlife, attractions)

Estos 4 tipos comparten la misma forma de `content`, editada con `PlaceListBlock.tsx` y renderizada en la guía con `PlaceListPanel.tsx`:

```typescript
// guide_blocks.content para restaurants | drinks | nightlife | attractions
{
  places: [
    {
      id: string,                 // uuid generado en el cliente, solo para React key
      name: string,
      description: string,        // 2 frases, se traduce automáticamente en EN
      address: string,
      distance_meters: number | null,
      maps_url: string,
      google_place_id: string | null,  // preparado para autocompletar desde Google Places API
      cuisine_type?: string,      // solo restaurants (ej. "Mariscos", "Tapas")
      price_level?: '€' | '€€' | '€€€' | null,  // solo restaurants y drinks
    }
  ]
}
```

En la guía pública las cards se ordenan por `distance_meters` ascendente (los lugares sin distancia van al final).

---

## Sistema de traducciones (guía pública ES/EN)

- **Bloques de tipo conocido** (wifi, checkin, checkout, rules, parking, appliances, pool, emergencias, restaurants, drinks, nightlife, attractions): el título se traduce con un diccionario estático en `lib/guide-i18n.ts` (`block_wifi`, `block_pool`, etc.) — sin llamar a Claude.
- **Bloques `custom`** (título libre del anfitrión) y **descripciones de lugares** (`PlaceEntry.description`): se traducen dinámicamente vía `POST /api/guide/translate-content` cuando el huésped cambia el idioma a EN.
- **Caché en BD:** antes de llamar a Claude se busca en `translations_cache` por `md5(texto)` + `target_lang`. Si existe, se devuelve sin gastar tokens. La caché es **global** — si dos anfitriones tienen la norma "No fumar", solo se traduce una vez en toda la vida del sistema.
- **Rate limiting** (en memoria, reset por ventana horaria/diaria): máximo 20 llamadas/IP/hora y 100 llamadas/`property_id`/día. Si se supera cualquiera de los dos, el endpoint devuelve el texto original sin error visible para el huésped (mismo comportamiento que si Claude fallara).
- **Modelo:** `claude-haiku-4-5-20251001` (function `translateText` en `lib/claude.ts`) — nunca `sonnet`, para mantener el coste marginal por traducción prácticamente nulo.
- El hook `useTranslatedText` (usado por `BlockTitle` y `PlaceListPanel`) mantiene además una caché en memoria del lado del cliente para no repetir el fetch dentro de la misma sesión de navegador.

---

## Arquitectura de la guía pública

- **Navegación por páginas separadas:** `/guide/[slug]` (hero + grid de tiles) → `/guide/[slug]/[type]` (una página por tipo de bloque) y `/guide/[slug]/recomendaciones`. Cada página de sección tiene su propio `BackToGuideButton` al final además del botón "Volver" del header.
- **Header de sección** (`GuideSectionHeader.tsx`): sticky, compacto en móvil (solo icono + nombre del alojamiento), usa `cover_image_url` como fondo con gradiente oscuro si existe, o `accent_color` sólido si no.
- **Idioma:** `GuideLocaleProvider` guarda ES/EN en `localStorage` (`guide-locale`) y expone `propertyId` en el mismo contexto para el rate limiting de traducciones.
- **Botón de WhatsApp:** `WhatsAppFab.tsx` — pill flotante verde (#25D366) con icono `MessageCircle`. Se resuelve en `app/guide/[slug]/layout.tsx`: usa `properties.whatsapp_number` si está relleno, y si no, hace fallback a `profiles.phone` del `host_id` de la propiedad (vía `createServiceRoleClient()`, porque `profiles` no tiene policy de SELECT pública). Solo se renderiza si alguno de los dos valores existe. Enlaza a `https://wa.me/{numero}`.
- **Avatar del anfitrión en el mensaje de bienvenida:** `WelcomeMessage.tsx` muestra un `Avatar` circular de 48px junto a "Hola, soy {nombre}" usando `profiles.avatar_url` (con fallback a iniciales). El lookup de `profiles` en `app/guide/[slug]/page.tsx` también usa `createServiceRoleClient()` por el mismo motivo de RLS.
- **WiFi con QR de conexión automática:** `WifiPanel.tsx` genera en el cliente (librería `qrcode`) un QR con el payload `WIFI:T:WPA;S:{red};P:{contraseña};;` (200×200px). Solo se muestra si hay red **y** contraseña rellenas — una red sin contraseña no genera QR.
- **Estado "ya estoy conectado":** se guarda en `localStorage` con key `wifi_connected_{property_id}` para persistir entre recargas; incluye enlace "Cambiar red" que borra la key.

---

## Imágenes y Storage (Supabase)

| Bucket | Uso | Límite | Procesado |
|---|---|---|---|
| `block-images` | Imágenes por bloque de contenido (hasta 3 por bloque) | 2MB, máx. 1200px de ancho | Reescaladas y convertidas a WebP con `sharp` |
| `cover-images` | Imagen de portada del hero (`properties.cover_image_url`) | 3MB, solo JPG | Reescalada a máx. 1920px de ancho, calidad 80% con `sharp` |
| `avatars` | Foto de perfil del anfitrión (`profiles.avatar_url`) | 1MB, JPG/PNG/WebP | Recortada a 200×200 centrada (`fit: cover`) y convertida a WebP con `sharp` |
| `support-screenshots` | Captura opcional adjunta a un ticket de soporte | 2MB, JPG/PNG/WebP | Sin reprocesar — solo se valida que sea una imagen decodificable |

Estructura común de imagen (campo `images` de `guide_blocks`, tipo `BlockImage[]`):

```typescript
{ url: string, alt: string, width: number, height: number, caption: string }
```

Todos los buckets son públicos para lectura (URL directa). Para `block-images`/`cover-images`, insert/update/delete están protegidos por RLS en `storage.objects` comprobando que el primer segmento de la ruta (`property_id`) pertenece al `host_id` autenticado. Para `avatars`/`support-screenshots`, el path es `{user_id}/...` y la política compara directamente contra `auth.uid()` (sin join a otra tabla).

---

## Sistema de soporte in-app

- **Widget flotante** (`SupportWidget.tsx`): botón "?" en la esquina inferior izquierda del **dashboard únicamente** (nunca en la guía pública). Al pulsarlo abre un panel con 3 opciones que preseleccionan el `type` del ticket: "Reportar un problema" (`bug`), "Sugerir una mejora" (`feature_request`), "Tengo una pregunta" (`question`).
- **Formulario:** asunto (máx. 100 caracteres), descripción (máx. 1000, con contador), captura de pantalla opcional (JPG/PNG/WebP, máx. 2MB). Envío como `multipart/form-data` a `POST /api/support/tickets`.
- **Backend:** el endpoint valida con Zod, sube la captura al bucket `support-screenshots` en `{user_id}/{timestamp}.{ext}`, e inserta el ticket con el cliente autenticado normal (cubierto por la policy `support_tickets_insert_own`). No existe ninguna policy de RLS anon/pública en `support_tickets` — el único acceso de lectura fuera del propio dueño es el panel admin, que usa `createServiceRoleClient()` protegido por `isSuperAdmin()`, siguiendo el mismo patrón defensivo que `guest_messages`/`bot_conversations`.
- **Notificación:** al crear el ticket se envía un email a `ignajac@gmail.com` vía Resend (`sendSupportTicketNotification` en `lib/email.ts`) con tipo, asunto, descripción y enlace a la captura si existe. El envío está en un try/catch best-effort — un fallo de Resend nunca bloquea la creación del ticket (mismo patrón lazy-init que el resto de emails transaccionales: si falta `RESEND_API_KEY` la función retorna sin lanzar error).
- **Confirmación al anfitrión:** tras el envío, el widget muestra "Hemos recibido tu mensaje, te responderemos en 24h" sin cerrar automáticamente el panel.
- **Panel superadmin (`/admin`):** sección "Soporte" (`AdminTicketsSection.tsx`) con filtros por tipo y estado, y botón "Marcar como resuelto" por ticket (`PATCH /api/admin/tickets/[id]`, actualiza `status` a `closed`). El link "Admin" del sidebar del dashboard muestra un badge con el recuento de tickets `open` (`(dashboard)/layout.tsx`, contado con el service-role client, solo visible para `isSuperAdmin`).

---

## Sistema de reservas y compartir guía

- **`/bookings`** (nueva sección "Reservas" en el sidebar/drawer del anfitrión): lista todas las reservas del anfitrión agrupadas visualmente por huésped/propiedad/fechas/estado, con botón "Nueva reserva" (`NewBookingDialog.tsx`) que abre un formulario (propiedad, nombre, email y teléfono opcionales, fechas de check-in/check-out, toggle "Enviar email de bienvenida automáticamente") y hace `POST /api/bookings`.
- **RLS de `bookings`:** al igual que `support_tickets`, se crea/lee/actualiza siempre por el propio anfitrión autenticado (`host_id = auth.uid()`) — no hay acceso anónimo, así que no aplica el patrón defensivo de service-role-only usado en `guest_messages`.
- **Concepto "mensaje de bienvenida compartible":** `lib/booking-message.ts` centraliza la plantilla (usada tanto en el cliente para el texto copiable como en el servidor para el email), con este formato exacto:
  > ¡Hola {nombre}! Te esperamos el {fecha checkin} a partir de las {hora checkin}. Aquí tienes toda la información para tu estancia en {nombre propiedad}: {enlace guía}. ¡Cualquier duda escríbeme!

  La hora de check-in se lee del bloque `checkin` de esa propiedad (`content.time`) — si la propiedad no tiene bloque `checkin`, la cláusula "a partir de las..." simplemente se omite.
- **`ShareGuideDialog.tsx`** (componente reutilizable, `components/dashboard/`): panel con el mensaje copiable (botón "Copiar mensaje" → `navigator.clipboard`, con feedback "¡Copiado!" 2s), enlace directo a la guía, y QR descargable (reutiliza `GET /api/properties/[id]/qr`, ya existente para el editor). Se usa en dos contextos:
  1. **Por reserva**, desde `/bookings` — con `guest` relleno (nombre + fecha), muestra mensaje + enlace + QR.
  2. **Genérico**, desde el botón "Compartir guía" del panel de Publicación del editor (`PublishPanel.tsx`) — con `guest={null}`, solo muestra enlace + QR (sin mensaje personalizado, ya que no hay huésped ni fecha).
- **Envío automático por email:** al crear una reserva con email y con el toggle activado, `POST /api/bookings` genera el QR como `Buffer` (`generateGuideQrCodeBuffer` en `lib/qr.ts`) y llama a `sendBookingWelcomeEmail` (`lib/email.ts`) — email con foto de portada, nombre del huésped, fechas de check-in/check-out y botón CTA "Ver mi guía", con el QR como adjunto (`qr-guia.png`). Envío best-effort en un try/catch: si falla (o falta `RESEND_API_KEY`), la reserva se crea igualmente y `welcome_email_sent_at` queda en `null`. Si tiene éxito, se guarda el timestamp y la lista de reservas muestra "Email enviado".

---

## Diseño / Sistema visual (guía pública)

- **Iconos:** Lucide React, line-style (`strokeWidth={1.5}`), en color `accent_color` de la propiedad (no negro). Mapeo completo en `lib/guide-icons.tsx` — incluye `Waves` (pool), `ShieldAlert` (emergencias), `UtensilsCrossed` (restaurants), `Wine` (drinks), `Music` (nightlife), `Landmark` (attractions).
- **Tipografía:** Playfair Display (serif, `font-serif`) para el nombre del alojamiento en el hero y los títulos `<h1>` de cada sección; Inter (sans, por defecto) para el resto del texto.
- **Tiles del grid principal:** fondo blanco, borde 1px gris muy claro, `border-radius` 16px (`rounded-2xl`), sombra sutil en reposo y más marcada al hover, borde en `accent_color` al hover/tap.
- **Hero:** si hay `cover_image_url`, se usa como fondo con `object-fit: cover` y un degradado oscuro (`transparent → black/70`) limitado a la mitad inferior donde está el texto — el resto de la imagen se ve con su brillo natural. Sin imagen, se mantiene el fondo sólido en `accent_color`.
- **Responsive mobile-first:** grid de tiles a 2 columnas en móvil (`<640px`), 3 columnas desde tablet/desktop (`≥640px`); padding de las páginas de sección escalonado (16px móvil / 24px tablet / 32px desktop).
- Nota: el tema visual del **panel del anfitrión** (dashboard, shadcn/ui) es independiente del `accent_color` por propiedad — usa su propia paleta cálida definida en `app/globals.css` vía variables OKLCH.

---

## Lógica de IA

### 1. Generación de contenido inicial

Cuando el anfitrión crea una propiedad y pulsa "Generar con IA", se llama a `/api/ai/generate-content`:

```typescript
// lib/claude.ts
export async function generateGuideContent(property: {
  name: string
  address: string
  hostTone: 'friendly' | 'formal'
}) {
  const prompt = `
Eres un asistente que ayuda a propietarios de alojamientos turísticos a crear guías para sus huéspedes.

Genera el contenido para la guía del siguiente alojamiento:
- Nombre: ${property.name}
- Dirección: ${property.address}
- Tono del anfitrión: ${property.hostTone === 'friendly' ? 'cercano, tuteo' : 'formal, usted'}

Devuelve SOLO un JSON con esta estructura exacta:
{
  "welcome_message": "Mensaje de bienvenida personalizado (2-3 frases)",
  "checkin_tips": ["tip1", "tip2", "tip3"],
  "checkout_tips": ["tip1", "tip2", "tip3"],
  "rules": ["norma1", "norma2", "norma3", "norma4", "norma5"],
  "neighborhood_description": "Descripción del barrio/zona en 2 frases"
}
`
  // llamada a Claude API (modelo sonnet)
}
```

### 2. Recomendaciones locales

Flujo en `/api/ai/recommendations`:

1. Llamar a Google Places Text Search con la dirección y categoría
2. Filtrar resultados con rating >= 4.0 y user_ratings_total >= 50
3. Pasar los top 5 resultados a Claude con el prompt:

```typescript
const recommendationsPrompt = `
Eres el asistente de ${property.name}, un alojamiento en ${property.address}.

Los huéspedes típicos son: ${guestProfile}

Estos son los ${category} más valorados cerca del alojamiento (datos de Google):
${JSON.stringify(places, null, 2)}

Selecciona los 3 mejores y escribe una descripción breve (máximo 2 frases) para cada uno.
La descripción debe ser útil y personal, no un resumen genérico.
Menciona algo específico: qué pedir, cuándo ir, qué hace especial al lugar.

Devuelve SOLO un JSON array:
[
  {
    "place_id": "...",
    "description": "..."
  }
]
`
```

### 3. Bot de WhatsApp

El prompt del bot se construye dinámicamente a partir del contenido de la guía:

```typescript
// lib/whatsapp/bot.ts
export function buildSystemPrompt(property: Property, blocks: GuideBlock[], recommendations: Recommendation[]) {
  return `
Eres el asistente virtual del alojamiento "${property.name}", ubicado en ${property.address}.
Respondes preguntas de los huéspedes que están alojados aquí.

Tono: ${property.host_tone === 'friendly' ? 'Cercano y amable, tutea al huésped' : 'Profesional y cortés'}
Idioma: Responde siempre en ${property.language === 'es' ? 'español' : 'el idioma del huésped'}

INFORMACIÓN DEL ALOJAMIENTO:
${blocks.map(block => formatBlock(block)).join('\n\n')}

RECOMENDACIONES CERCANAS:
${recommendations.map(r => `- ${r.name} (${r.category}): ${r.description}. Distancia: ~${Math.round(r.distance_meters / 100) * 100}m`).join('\n')}

INSTRUCCIONES:
- Responde SOLO con información que está en este contexto
- Si el huésped pregunta algo que no está aquí, dile amablemente que contacte con el anfitrión directamente
- Sé conciso — máximo 3-4 frases por respuesta
- No inventes información
- Para recomendaciones de restaurantes, menciona la distancia a pie
`
}
```

### 4. Traducción de la guía pública

Ver sección "Sistema de traducciones" arriba — usa `claude-haiku-4-5-20251001` en vez de `sonnet`, con caché en BD y rate limiting, vía `/api/guide/translate-content`.

---

## Modelo de costes de IA

- Todas las llamadas de IA (generación de contenido, recomendaciones, bot, traducciones) se hacen con la **API key de Anthropic del propietario del SaaS** — el anfitrión nunca aporta su propia clave.
- La caché agresiva de traducciones en BD (global entre anfitriones) es la principal palanca de ahorro: una norma común como "No fumar" solo se traduce una vez en la vida del sistema, sin importar cuántas propiedades la usen.
- `claude-haiku-4-5` para traducciones (20x más barato que sonnet, calidad suficiente para textos cortos); `claude-sonnet-4-6` reservado para generación de contenido y recomendaciones, donde la calidad del texto importa más.
- Coste estimado con caché caliente: **<0.01€/propiedad/mes** en traducciones.
- El rate limiting (20/IP/hora, 100/property/día) actúa como red de seguridad frente a tráfico anómalo o scraping, no como límite de uso normal esperado.

---

## Modelo de negocio

**`lib/plans.ts` es la fuente única de verdad** para precios, límites y guards de cada plan — no hardcodear estos valores en ningún otro sitio (páginas, componentes, endpoints). `types/index.ts` define `Plan = "free" | "starter" | "pro" | "agency"`, y `profiles.plan` está restringido a esos 4 valores por constraint en BD.

| Plan | Precio | Propiedades | IA (contenido/recomendaciones) | Estadísticas | Marca blanca |
|------|--------|--------------|------------------------------|--------------|--------------|
| Free | 0€/mes | 1 | ❌ | ❌ | ❌ |
| Starter | 4€/mes | 3 | ✅ | ❌ | ❌ |
| Pro | 12€/mes | 10 | ✅ | ✅ | ❌ |
| Agency | 29€/mes | 30 | ✅ | ✅ | ✅ |

- `getPlan(planId)` / `planPropertyLimit(planId)` en `lib/plans.ts` — usado por `/api/properties` (POST) para bloquear la creación de propiedades por encima del límite del plan, y por el modal "Cambiar de plan" (`ChangePlanDialog.tsx`) y `/account` para mostrar precio y features.
- Los guards `aiEnabled` / `analyticsEnabled` / `whiteLabel` de `lib/plans.ts` describen qué debería estar disponible por plan; **todavía no hay enforcement de estos guards en el código** (p. ej. no se oculta el botón "Generar con IA" en plan Free) — son la fuente de verdad para cuando se implemente esa restricción.
- **Cambio de plan:** los anfitriones ven sus opciones y contactan por email desde `/account` (sin Stripe todavía — el botón de planes superiores abre un `mailto:` a `ignajac@gmail.com`). El único lugar que efectivamente *cambia* `profiles.plan` hoy es el panel de superadmin.
- **Panel de superadmin** (`/admin`, `lib/admin.ts`): acceso restringido al email `ignajac@gmail.com` (redirige a `/login` para cualquier otro usuario, autenticado o no). Lista todos los anfitriones (email vía `auth.admin.listUsers()`, plan, nº de propiedades, fecha de registro), permite cambiar el plan de cualquier anfitrión con un select (`PATCH /api/admin/profiles/[id]/plan`, revalida el email en el servidor además de en la página), y muestra estadísticas globales (anfitriones, propiedades totales, publicadas vs borrador).
- Cuando Stripe esté conectado de verdad: `getPriceToPlan()` en `app/api/stripe/webhook/route.ts` ya mapea `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_AGENCY` a cada plan — solo falta rellenar esas env vars y probar el flujo de checkout.

---

## Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Variables de entorno necesarias
cp .env.example .env.local
# Rellenar: ANTHROPIC_API_KEY, GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
# SUPABASE_SERVICE_ROLE_KEY, YCLOUD_API_KEY, STRIPE_SECRET_KEY, RESEND_API_KEY

# Desarrollo local
npm run dev

# Supabase local
npx supabase start
npx supabase db reset   # Aplica todas las migrations

# Aplicar migraciones nuevas al proyecto remoto
npx supabase db push

# Deploy
vercel deploy --prod
```

---

## Convenciones de código

- **Componentes:** PascalCase, un componente por archivo
- **API routes:** kebab-case, validación con Zod en todas las rutas
- **Tipos:** Definir interfaces en `/types/index.ts`, derivar tipos de Supabase con `Database` type
- **Errores:** Siempre retornar `{ error: string }` con el status HTTP correcto
- **Variables de entorno:** Prefijo `NEXT_PUBLIC_` solo para lo que necesite el cliente
- **Imágenes:** Subir a Supabase Storage, nunca al repositorio
- **Textos de la guía pública:** nunca hardcodear strings ES/EN en componentes — añadir la clave en `lib/guide-i18n.ts`. Los tipos de bloque conocidos usan `t("block_<tipo>")`; solo el contenido libre (custom, descripciones de lugares) pasa por `/api/guide/translate-content`

---

## Flujo principal del usuario (anfitrión)

1. Registro → onboarding de 3 pasos (nombre del alojamiento, dirección, foto)
2. La IA genera el borrador de contenido automáticamente
3. El anfitrión revisa/edita los bloques en el editor visual, incluyendo bloques especializados de recomendaciones (dónde comer, copas y bares, ocio nocturno, qué visitar)
4. Genera recomendaciones locales → revisa, edita, descarta las que no le gusten
5. Sube imagen de portada y configura su número de WhatsApp desde el panel de Publicación
6. Publica → obtiene URL única + QR descargable
7. (Pro) El bot de WhatsApp queda activo con el número configurado

## Flujo del huésped

1. Escanea QR o recibe enlace por WhatsApp/email al hacer check-in
2. Accede a la guía sin registro, en su idioma (ES/EN, con traducción automática de contenido libre)
3. Navega por tiles → consulta info del apartamento
4. En WiFi, escanea el QR de conexión automática y marca "Ya estoy conectado"
5. (Pro) Escribe por WhatsApp → el bot responde automáticamente, o usa el botón flotante de WhatsApp para contactar directamente con el anfitrión

---

## Notas importantes

- El slug de la guía debe ser único y generarse a partir del nombre del alojamiento (slugify)
- Las guías deben funcionar offline (PWA / Service Worker) para huéspedes sin buena conexión
- RLS de Supabase: los anfitriones solo acceden a sus propias propiedades; `translations_cache` no tiene políticas públicas — solo se lee/escribe desde el servidor con `createServiceRoleClient()`
- El webhook de YCloud se conecta al n8n self-hosted en ia.neurodatos.com
- Google Places API tiene coste por llamada — implementar caché en Supabase (TTL 30 días por localización)
- El número de WhatsApp del bot es el de YCloud — el anfitrión no da su número personal al bot, solo para el botón directo (`whatsapp_number` en `properties`)
- La caché de traducciones es global e indefinida (sin TTL) — un texto traducido una vez no se vuelve a traducir nunca, ni para otro anfitrión
