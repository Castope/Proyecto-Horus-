# 📱 Diseño Responsive - Sección Educación

## Resumen de Mejoras

Se ha implementado un diseño responsive completo en la sección de educación con soporte para todos los tamaños de pantalla.

## Breakpoints Implementados

### 1️⃣ **1200px - Tablet Landscape (lg)**
- Reducción del ancho de fondo en hero sections (de 55% a 50%)
- Ajuste de gaps en grillas
- Preparación para pantallas más pequeñas

### 2️⃣ **1024px - Tablet (md)**
- Hero section en una columna
- Eliminación de fondos decorativos
- Modales de programa pasadas a 2 columnas
- CTA section reorganizada verticalmente
- Padding global reducido a 80px

### 3️⃣ **768px - Tablet Portrait (sm)**
- Todas las grillas en 1 columna
- Tarjetas con padding reducido (20px)
- Fuentes escaladas con clamp()
- Ocultamiento de hero cards (tarjetas decorativas)
- Padding de secciones: 60px
- Buttons en hero full-width en mobile

### 4️⃣ **640px - Small Mobile (xs)**
- Hero buttons en column layout
- Fuentes más pequeñas (máximo 0.9rem en párrafos)
- Padding agresivo en tarjetas (16px)
- Grid gaps reducidos a 16px
- Padding de secciones: 48px

### 5️⃣ **480px - Extra Small (xxs)**
- Fuentes mínimas y optimizadas
- Padding extremadamente reducido (12px en tarjetas)
- Container padding: 16px
- Números de program cards: 2rem
- Icons reducidos a 36-40px

## Mejoras Específicas

### Hero Sections
- ✅ Layout responsivo (2col → 1col en tablet)
- ✅ Hero cards ocultas en mobile (≤768px)
- ✅ Imagen con altura variable (420px → 180px)
- ✅ Botones full-width en mobile
- ✅ Tipografía escalada con clamp()

### Tarjetas (Cards)
- ✅ Padding dinámico según dispositivo
- ✅ Border radius ajustado
- ✅ Tamaño de icons responsive
- ✅ Texto optimizado por pantalla

### Grillas
- **ed-types-grid**: 3 cols → 2 cols (1024px) → 1 col (768px)
- **ed-modalities-grid**: 3 cols → 2 cols (1024px) → 1 col (768px)  
- **ed-prog-grid**: 2 cols → 1 col (768px)
- **ed-benefits-grid**: 2 cols → 1 col (1024px)

### Tipografía
- Títulos usando `clamp()` para escalado suave
- Textos base adaptados por breakpoint
- Mantenimiento de jerarquía visual

### Espaciado
- Padding de secciones: 96px → 60px → 40px
- Gaps en grillas: 20px → 16px
- Márgenes bottom: escalados según pantalla

## Componentes Responsivos

### ✅ Asesoramiento.jsx
- Hero con background gradiente adaptable
- Grid de tipos (3 → 1 columna)
- Grid de beneficios (2 → 1 columna)

### ✅ Capacitaciones.jsx
- Hero responsive
- Grid de programas (2 → 1 columna)
- Cards con contenido prioritario

### ✅ Cursos.jsx
- Hero responsive
- Grid de modalidades (3 → 1 columna)
- Cards con información clara

## Pruebas Recomendadas

- [ ] Desktop (1920px+)
- [ ] Laptop (1200px-1919px)
- [ ] Tablet Landscape (1024px-1199px)
- [ ] Tablet Portrait (768px-1023px)
- [ ] Mobile Grande (640px-767px)
- [ ] Mobile Pequeño (480px-639px)
- [ ] Mobile Mínimo (320px-479px)

## Notas Técnicas

- Se mantiene el mobile-first approach
- Todos los breakpoints tienen estilos completos
- Los estilos evitan código duplicado usando selectores y propiedades CSS
- Se usa `clamp()` para tipografía fluida
- Las imágenes son responsive con object-fit

---

**Última actualización**: 2026-09-01
**Archivos modificados**: 
- `/src/styles/educacion.css`
