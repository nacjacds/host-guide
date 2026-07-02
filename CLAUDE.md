# CLAUDE.md — Guía Digital Huéspedes (nombre por definir)

## Visión del producto

Web app SaaS para anfitriones de alojamientos turísticos (Airbnb, Vrbo, Booking) que genera automáticamente una guía digital personalizada para sus huéspedes, con recomendaciones locales generadas por IA y un asistente de WhatsApp integrado.

**Propuesta de valor:** El anfitrión rellena su información una vez → la IA genera el contenido → el huésped accede vía QR o enlace sin instalar nada.

**Diferenciador clave vs competencia (Touch Stay, Hostfully, Maestro Host):**
- Recomendaciones locales generadas por IA (Google Places API + Claude) editables por el anfitrión
- Asistente de WhatsApp que responde preguntas del huésped usando el contenido de la guía como base de conocimiento
- Precio justo para el mercado español: plan básico 9€/mes, plan pro 24€/mes
- Sin complejidad de PMS — solo guía + IA + WhatsApp

---

## Stack técnico

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **IA:** Anthropic Claude API (claude-sonnet-4-6) para generación de contenido y respuestas del bot
- **Recomendaciones locales:** Google Places API (Text Search + Place Details)
- **WhatsApp:** YCloud (WhatsApp Business API) + n8n para workflows
- **Deploy:** Vercel (frontend) + OVH VPS con EasyPanel (n8n self-hosted en ia.neurodatos.com)
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
│   │   └── account/            # Plan, facturación, perfil
│   ├── guide/
│   │   └── [slug]/             # Guía pública del huésped (sin auth)
│   └── api/
│       ├── properties/
│       ├── guides/
│       ├── ai/
│       │   ├── generate-content/   # Genera borrador inicial con Claude
│       │   └── recommendations/    # Recomendaciones Google Places + Claude
│       ├── whatsapp/
│       │   └── webhook/            # Webhook de YCloud para mensajes entrantes
│       └── stripe/
│           └── webhook/
├── components/
│   ├── guide/                  # Componentes de la guía pública
│   │   ├── HeroSection.tsx
│   │   ├── TileGrid.tsx
│   │   ├── TilePanel.tsx
│   │   └── ContactButtons.tsx
│   ├── editor/                 # Componentes del editor del anfitrión
│   │   ├── BlockEditor.tsx
│   │   ├── blocks/
│   │   │   ├── WifiBlock.tsx
│   │   │   ├── CheckinBlock.tsx
│   │   │   ├── RulesBlock.tsx
│   │   │   ├── RecommendationsBlock.tsx
│   │   │   └── CustomBlock.tsx
│   │   └── AIGenerateButton.tsx
│   └── ui/                     # Componentes genéricos (shadcn/ui)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── claude.ts               # Cliente Claude API + funciones de generación
│   ├── google-places.ts        # Cliente Google Places API
│   ├── whatsapp/
│   │   ├── ycloud.ts           # Cliente YCloud
│   │   └── bot.ts              # Lógica del bot — build prompt + llamada Claude
│   └── qr.ts                   # Generación de QR codes
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
  phone text,
  plan text DEFAULT 'free',        -- 'free' | 'basic' | 'pro'
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
  cover_image_url text,
  accent_color text DEFAULT '#1B4F72',
  host_tone text DEFAULT 'friendly', -- 'friendly' | 'formal'
  language text DEFAULT 'es',
  whatsapp_number text,            -- Número del anfitrión para el botón WA
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Bloques de contenido de la guía
guide_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  type text NOT NULL,              -- 'wifi' | 'checkin' | 'checkout' | 'rules' | 'parking' | 'appliances' | 'custom'
  title text,
  icon text,
  content jsonb NOT NULL,          -- Estructura específica por tipo de bloque
  order_index integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)

-- Recomendaciones locales
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
```

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
  // llamada a Claude API
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

---

## Planes y límites

| Feature | Free | Basic (9€/mes) | Pro (24€/mes) |
|---------|------|----------------|---------------|
| Propiedades | 1 | 3 | Ilimitadas |
| Bloques de contenido | 5 | Ilimitados | Ilimitados |
| Recomendaciones IA | ❌ | ✅ | ✅ |
| Generación de contenido IA | ❌ | ✅ | ✅ |
| Bot WhatsApp | ❌ | ❌ | ✅ |
| QR descargable | ✅ | ✅ | ✅ |
| Multiidioma | ❌ | ES + EN | Ilimitado |
| Soporte | Email | Email | Prioritario |

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

---

## Flujo principal del usuario (anfitrión)

1. Registro → onboarding de 3 pasos (nombre del alojamiento, dirección, foto)
2. La IA genera el borrador de contenido automáticamente
3. El anfitrión revisa/edita los bloques en el editor visual
4. Genera recomendaciones locales → revisa, edita, descarta las que no le gusten
5. Publica → obtiene URL única + QR descargable
6. (Pro) Configura su número de WhatsApp → el bot queda activo

## Flujo del huésped

1. Escanea QR o recibe enlace por WhatsApp/email al hacer check-in
2. Accede a la guía sin registro
3. Navega por tiles → consulta info del apartamento
4. (Pro) Escribe por WhatsApp → el bot responde automáticamente

---

## Notas importantes

- El slug de la guía debe ser único y generarse a partir del nombre del alojamiento (slugify)
- Las guías deben funcionar offline (PWA / Service Worker) para huéspedes sin buena conexión
- RLS de Supabase: los anfitriones solo acceden a sus propias propiedades
- El webhook de YCloud se conecta al n8n self-hosted en ia.neurodatos.com
- Google Places API tiene coste por llamada — implementar caché en Supabase (TTL 30 días por localización)
- El número de WhatsApp del bot es el de YCloud — el anfitrión no da su número personal al bot, solo para el botón directo
