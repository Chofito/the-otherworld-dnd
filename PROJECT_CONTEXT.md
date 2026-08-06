# The Otherworld D&D

## Contexto del proyecto

Este documento resume las conversaciones iniciales y las decisiones de alcance para retomar el proyecto en una nueva sesión desde WSL.

La idea es crear un sitio web sencillo, atractivo y temático para organizar la incorporación de amigos a su primera partida de D&D. El grupo está empezando y el sitio no pretende convertirse, por ahora, en una plataforma completa para administrar campañas durante el juego.

El objetivo principal es que el Dungeon Master pueda crear una campaña, generar invitaciones y recibir la información de los personajes de sus amigos. Para los jugadores, el sitio debe ser una experiencia simple: abrir un enlace, conocer la campaña, completar sus datos y revisar un resumen de lo enviado.

## Historial de decisiones

### Primera idea

El alcance inicial planteaba:

1. Una landing page sencilla.
2. Enlaces de invitación para cuatro amigos, con posibilidad de crecer en el futuro.
3. Soporte para varias campañas y al menos tres grupos de amigos.
4. Invitaciones con una introducción de la campaña y un formulario para elegir clase, nombre de personaje y otros datos.

La primera propuesta consideró una aplicación con Next.js, Supabase y Vercel, usando Tailwind CSS para los estilos. También se evaluó un monorepo para el frontend y los elementos relacionados con Supabase.

### Ajuste importante de alcance

El sitio no se usará, por ahora, para gestionar las campañas durante el juego. No se necesitan todavía sesiones, tiradas de dados, iniciativa, notas, calendario ni hojas de personaje completas.

Sí se necesita un dashboard privado para el Dungeon Master. El alcance actual queda definido así:

1. Página principal.
2. Dashboard de administración.
3. Creación y gestión de campañas desde el dashboard.
4. Creación, copia y revocación de enlaces de invitación.
5. Visualización de usuarios/invitados y personajes enviados.
6. Página de invitación con introducción de la campaña y formulario de creación de personaje.
7. El mismo enlace cambia de estado después del envío y muestra un resumen de lo que la persona completó.
8. El resumen puede confirmarse/aceptarse usando el mismo enlace.

La experiencia debe sentirse como una invitación especial para una aventura, no como un panel administrativo complejo.

## Alcance funcional actual

### Página principal

Landing page minimalista y temática que puede incluir:

- Nombre del sitio o del mundo.
- Una frase corta que presente la aventura.
- Una estética de fantasía sobria.
- Un acceso discreto para el Dungeon Master.
- El acceso principal de los jugadores debe ocurrir mediante enlaces de invitación, no necesariamente desde la landing.

### Dashboard del Dungeon Master

El dashboard es privado y sirve para administrar las campañas propias.

Funciones previstas:

- Iniciar sesión como Dungeon Master.
- Ver la lista de campañas.
- Crear una campaña.
- Editar la información de una campaña.
- Ver el estado de las invitaciones.
- Generar nuevos enlaces.
- Copiar enlaces de invitación.
- Revocar enlaces.
- Ver los personajes enviados para una campaña.
- Revisar y aceptar personajes.
- Posiblemente solicitar cambios antes de la aceptación final.

Una vista de detalle de campaña podría mostrar:

- Nombre y descripción de la campaña.
- Número de invitaciones creadas.
- Número de formularios enviados.
- Número de personajes aceptados.
- Lista de invitaciones con estado.
- Lista de personajes con nombre, clase, ascendencia y resumen del trasfondo.

El dashboard puede ser más funcional y sobrio que la experiencia pública. No es necesario aplicar todos los elementos decorativos de fantasía en esta parte.

### Página de invitación

La ruta pública usa un token único, por ejemplo:

`/invite/[token]`

El mismo enlace tiene diferentes estados:

#### Estado `pending`

- Muestra la introducción de la campaña.
- Muestra la información relevante para la partida.
- Presenta el formulario de creación de personaje.

Datos iniciales sugeridos para el formulario:

- Nombre del personaje.
- Clase.
- Ascendencia o raza.
- Nivel inicial.
- Trasfondo o breve historia.
- Otros datos básicos que se definan para la primera partida.

#### Estado `submitted`

Después de enviar el formulario, el mismo enlace deja de mostrar el formulario inicial y muestra un resumen del personaje.

El resumen debería presentar la información de forma atractiva, como una pequeña ficha o tarjeta de personaje:

- Nombre.
- Clase.
- Ascendencia.
- Nivel.
- Trasfondo.
- Información de la campaña a la que fue invitado.

Mientras el Dungeon Master no lo haya aceptado, podría existir una opción para editar los datos y corregir errores.

#### Estado `accepted`

Cuando el personaje es aceptado, el resumen queda bloqueado o deja de permitir modificaciones. Puede mostrar un mensaje final de bienvenida a la aventura.

La interpretación recomendada para el flujo es:

1. El jugador completa el formulario.
2. El jugador revisa y confirma su resumen.
3. El Dungeon Master revisa el envío desde el dashboard.
4. El Dungeon Master acepta el personaje.
5. El mismo enlace muestra el resumen final bloqueado.

Si se desea un flujo todavía más simple, el envío del jugador puede considerarse aceptación automática y el dashboard solo servir para revisar los datos. Esa decisión puede tomarse durante la implementación.

#### Estados adicionales

- `revoked`: el Dungeon Master invalidó el enlace.
- `expired`: el enlace dejó de ser válido después de su fecha de expiración.

Estas páginas pueden tener mensajes temáticos, pero deben informar claramente al usuario qué ocurrió.

## Stack propuesto

### Frontend y servidor

- Next.js con App Router.
- TypeScript.
- Vercel para el despliegue.
- Server Components y Server Actions o Route Handlers según el caso.

Next.js permite renderizar la página de invitación en el servidor y procesar el token sin exponer información sensible al navegador.

### Base de datos y servicios

- Supabase.
- PostgreSQL para los datos.
- Supabase Auth únicamente para el Dungeon Master.
- Supabase Storage como posibilidad futura para imágenes de campañas o retratos.
- Supabase CLI para migraciones y desarrollo local.
- Row Level Security (RLS) habilitado como protección de la base de datos.

Los jugadores no necesitan cuentas en esta primera versión. El token del enlace es su forma de acceso.

### Estilos

- Tailwind CSS.
- Variables CSS para colores y tema.
- Un sistema visual pequeño y consistente, sin sobrecargar cada pantalla con decoración.

### Validación y tipos

- Zod para validar formularios y datos recibidos.
- React Hook Form si el formulario empieza a crecer o necesita validación interactiva.
- Tipos TypeScript generados desde el esquema de Supabase.

No se recomienda añadir Prisma o Drizzle inicialmente. Para este alcance, `supabase-js`, las migraciones y los tipos generados son suficientes.

## Organización del repositorio

Inicialmente se consideró un monorepo completo, pero para este alcance no es necesario introducir Turborepo u otra capa de workspaces.

La recomendación es mantener un solo repositorio con la aplicación Next.js y la carpeta de Supabase:

```text
the-otherworld-dnd/
├── src/                    # Aplicación Next.js
├── public/                 # Recursos públicos
├── supabase/
│   ├── migrations/         # Cambios versionados de la base de datos
│   ├── seed.sql            # Datos iniciales opcionales
│   └── config.toml         # Configuración local de Supabase
├── package.json
└── PROJECT_CONTEXT.md
```

Esto permite versionar frontend, migraciones y configuración de Supabase en el mismo lugar sin pagar el coste de mantener un monorepo real.

Se puede migrar a pnpm workspaces o Turborepo si más adelante aparecen varias aplicaciones, por ejemplo:

- Una aplicación pública.
- Un dashboard separado.
- Una aplicación móvil.
- Paquetes compartidos de tipos o componentes.

## Modelo de datos recomendado

El modelo puede empezar con tres tablas propias, además de `auth.users` de Supabase.

### `campaigns`

Representa una campaña o aventura creada por el Dungeon Master.

Campos sugeridos:

- `id`: identificador.
- `dm_id`: referencia al usuario autenticado que administra la campaña.
- `name`: nombre de la campaña.
- `slug`: identificador legible para URLs, si se necesita.
- `intro`: introducción o presentación de la aventura.
- `cover_image_url`: opcional.
- `starting_level`: nivel inicial.
- `max_players`: límite esperado de jugadores; inicialmente puede ser 4.
- `status`: por ejemplo `draft`, `inviting`, `ready` o `archived`.
- `created_at`.
- `updated_at`.

Una campaña pertenece a un único Dungeon Master en esta primera versión.

### `invites`

Representa un enlace de invitación individual.

Campos sugeridos:

- `id`.
- `campaign_id`.
- `token`: identificador único y difícil de adivinar.
- `status`: `pending`, `submitted`, `accepted`, `revoked` o `expired`.
- `expires_at`: opcional.
- `submitted_at`: opcional.
- `accepted_at`: opcional.
- `created_at`.
- `updated_at`.

Cada amigo puede recibir un token distinto. Esto permite revocar un enlace concreto y mantener un historial claro.

El token puede ser un UUID v4 o un identificador aleatorio de alta entropía. No debe utilizar información predecible como el nombre de la campaña o un contador.

### `characters`

Representa la información enviada desde una invitación.

Campos sugeridos:

- `id`.
- `invite_id`: referencia única a `invites`; una invitación crea como máximo un personaje.
- `campaign_id`: referencia a la campaña; puede mantenerse para facilitar consultas del dashboard.
- `name`.
- `class`.
- `ancestry` o `race`, según la terminología que se quiera usar.
- `level`.
- `backstory`.
- `stats`: `jsonb` opcional para datos futuros como atributos, habilidades o puntos de vida.
- `created_at`.
- `updated_at`.

Los campos principales deben ser columnas normales para poder mostrarlos y filtrarlos fácilmente. Los datos que todavía no están definidos pueden ir en `jsonb`, evitando diseñar desde el inicio una ficha completa de D&D.

### Tablas que no hacen falta por ahora

No se necesitan inicialmente:

- `profiles` para jugadores.
- `campaign_members`.
- Usuarios de jugadores.
- Sesiones de juego.
- Tiradas de dados.
- Iniciativa.
- Calendario.
- Notas compartidas.

`auth.users` es suficiente para identificar al Dungeon Master.

## Seguridad

El enlace de invitación será el mecanismo de acceso de los jugadores, por lo que debe tratarse como un secreto.

Recomendaciones:

- Usar tokens largos y aleatorios.
- No exponer el `service role key` en el cliente.
- Procesar la consulta de invitación del lado servidor.
- No permitir que el cliente consulte libremente todas las invitaciones o campañas.
- Validar el estado del token antes de mostrar o modificar información.
- Permitir que el Dungeon Master revoque un enlace.
- Considerar expiración opcional.
- Habilitar RLS en Supabase.

Una implementación sencilla puede usar el servidor de Next.js para consultar la invitación por token. El `service role key`, si se utiliza para estas operaciones, debe existir únicamente en variables de entorno del servidor. El navegador nunca debe recibirlo.

Para el dashboard, Supabase Auth identifica al Dungeon Master y las políticas deben limitar el acceso a campañas cuyo `dm_id` coincida con el usuario autenticado.

## Experiencia visual

La dirección visual buscada es minimalista, elegante y con temática de fantasía, evitando una estética recargada o infantil.

La regla principal es:

> Una fuente temática para títulos, una fuente muy legible para el contenido, una paleta limitada y como máximo una textura sutil.

### Fuentes recomendadas

Combinación principal:

- **Cinzel** para títulos, logotipo y encabezados.
- **Alegreya** o **Crimson Pro** para textos largos, introducciones y formularios.

Alternativas:

- **IM Fell English** para citas o fragmentos con aspecto de libro antiguo; usarla con moderación porque es menos cómoda para interfaces largas.
- **Inter** para botones, controles y dashboard si se busca un contraste entre herramienta moderna y temática fantástica.
- **Uncial Antiqua** o **MedievalSharp** solo para un logotipo o detalle puntual; pueden ser demasiado decorativas para el cuerpo del sitio.

### Paletas posibles

#### Parchment & Ink

Tema claro, clásico y cálido:

- Fondo: `#FAF6EC`
- Superficie: `#F1EAD8`
- Texto: `#1C1917`
- Acento oxblood: `#7F1D1D`
- Acento dorado: `#A16207`

#### Tavern Dark

Tema oscuro, cálido y atmosférico. Es la recomendación principal para D&D:

- Fondo: `#0E0B08`
- Superficie: `#1A1510`
- Texto: `#E8E0D0`
- Acento ember: `#D97706`
- Acento arcano: `#7C3AED`

#### Arcane Minimal

Tema oscuro más moderno y mágico:

- Fondo: `#101018`
- Superficie: `#181824`
- Texto: `#E4E4EF`
- Acento violeta: `#8B5CF6`
- Secundario plateado: `#94A3B8`

La recomendación es elegir una sola paleta inicial y definirla mediante variables CSS. Así se puede incorporar un modo claro u oscuro más adelante sin rehacer todos los componentes.

### Texturas y decoración

Una textura de ruido o papel en SVG, con una opacidad aproximada del 3%, puede aportar ambiente sin dominar la interfaz.

Evitar combinar demasiados elementos temáticos al mismo tiempo:

- Fondos de pergamino muy intensos.
- Bordes ornamentales en todos los componentes.
- Demasiados dorados.
- Sellos, runas y marcos en cada sección.

La landing, la introducción de la invitación y el resumen del personaje son los lugares donde puede concentrarse la personalidad visual. El dashboard debe priorizar claridad.

## Rutas sugeridas

```text
/
/login
/dashboard
/dashboard/campaigns/new
/dashboard/campaigns/[id]
/invite/[token]
```

Las rutas exactas pueden adaptarse a la estructura de Next.js, pero la separación conceptual debería mantenerse.

## Orden de implementación

### Fase 1: Fundación visual

- Definir nombre, tono y dirección visual.
- Configurar Tailwind.
- Definir fuentes y variables de color.
- Crear la landing page.

### Fase 2: Datos y autenticación

- Crear el proyecto de Supabase.
- Crear las migraciones de `campaigns`, `invites` y `characters`.
- Configurar autenticación solo para el Dungeon Master.
- Generar los tipos TypeScript.
- Configurar RLS.

### Fase 3: Dashboard

- Lista de campañas.
- Crear campaña.
- Detalle de campaña.
- Generación y copia de enlaces.
- Revocación de invitaciones.
- Lista de envíos y personajes.
- Aceptación de personajes.

### Fase 4: Experiencia de invitación

- Página pública por token.
- Estado `pending` con introducción y formulario.
- Guardado del personaje.
- Estado `submitted` con resumen.
- Confirmación o edición previa a la aceptación.
- Estado `accepted` con resumen bloqueado.
- Estados `revoked` y `expired`.

### Fase 5: Pulido

- Responsive para móvil.
- Estados de carga y error.
- Mensajes claros para usuarios no técnicos.
- Mejoras de tipografía, espaciado y microinteracciones.
- Revisión de seguridad de los tokens.

## Fuera de alcance por ahora

No implementar todavía:

- Gestión de campañas durante las partidas.
- Hojas de personaje completas.
- Edición avanzada de habilidades, hechizos o inventario.
- Cuentas para jugadores.
- Chat.
- Calendario o programación de sesiones.
- Tirador de dados.
- Rastreador de iniciativa.
- Notas compartidas.
- Mapas interactivos.
- Realtime.
- Aplicación móvil.
- Sistema completo de permisos para múltiples Dungeon Masters.

El sitio debe hacer una cosa bien: presentar la aventura, recoger los personajes de los amigos y dar al Dungeon Master una vista clara de quién está invitado y qué personaje eligió cada persona.

## Decisiones pendientes

Antes o durante la implementación habrá que definir:

1. Si el jugador debe pulsar un botón final de confirmación después de revisar el resumen.
2. Si la aceptación final la realiza el Dungeon Master desde el dashboard.
3. Si los jugadores pueden editar sus datos después de enviarlos y antes de la aceptación.
4. Si las invitaciones expiran o permanecen válidas hasta ser revocadas.
5. Si se usará `race` o `ancestry` en la interfaz y en la base de datos.
6. Qué campos exactos tendrá el primer formulario.
7. Si la campaña tendrá una imagen de portada desde la primera versión.
8. Si se usará la paleta clara Parchment & Ink o la oscura Tavern Dark.

## Resumen ejecutivo para la siguiente sesión

Construir una aplicación Next.js con TypeScript y Tailwind, desplegada en Vercel y conectada a Supabase. Solo el Dungeon Master tendrá cuenta y dashboard. El dashboard permitirá crear campañas, generar y revocar invitaciones y revisar personajes.

Los jugadores accederán mediante un enlace único sin crear cuenta. La ruta `/invite/[token]` será una página de estado: primero mostrará la introducción y el formulario; después del envío mostrará un resumen del personaje usando el mismo enlace; finalmente, tras la aceptación, mostrará un resumen bloqueado.

El esquema inicial debe mantenerse pequeño: `campaigns`, `invites` y `characters`, junto con `auth.users` para el Dungeon Master. La estética debe ser minimalista, con una fuente temática como Cinzel para títulos, una fuente legible como Alegreya o Crimson Pro para contenido y una paleta cálida de fantasía, preferiblemente Tavern Dark.

No convertir todavía el proyecto en una plataforma completa de gestión de D&D. Priorizar una experiencia bonita, simple y clara para un grupo de principiantes.
