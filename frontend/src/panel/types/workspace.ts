export type Row = { id: number; [key: string]: string | number | boolean | null };
export type Field = { key: string; label: string; type?: 'textarea' | 'select' | 'number' | 'email' | 'url' | 'date'; required?: boolean; min?: number; max?: number; options?: string[] };
export type Resource = { label: string; singular: string; endpoint: string; icon: string; description: string; catalog?: boolean; title: string; fields: Field[]; states: string[] };
export type DashboardStats = {
  stats: {
    mensajes: { total: number; nuevos: number; enProceso: number; atendidos: number };
    reclamaciones: { total: number };
    contenido: { total: number };
    catalogo: Record<string, { total: number; publicados: number; borradores: number; archivados: number }>;
  };
  actividadReciente: { mensajes: { id: number; nombre: string; asunto: string; estado: string; createdAt: string }[] };
};
const title: Field = { key: 'titulo', label: 'Título', required: true, min: 2, max: 160 };
const slug: Field = { key: 'slug', label: 'Identificador URL (slug)', required: true, min: 2, max: 180 };
const description: Field = { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true, min: 3, max: 20000 };
const states = ['borrador', 'publicado', 'archivado'];
const state: Field = { key: 'estado', label: 'Estado', type: 'select', options: states, required: true };
export const resources: Record<string, Resource> = {
  cursos: { label: 'Cursos y capacitaciones', singular: 'curso', endpoint: 'cursos', icon: 'book', catalog: true, title: 'titulo',
    description: 'Organiza tu oferta educativa, sus temarios y fechas de inicio.', states,
    fields: [title, slug, description, { key: 'tipo', label: 'Tipo', type: 'select', options: ['curso', 'capacitacion'], required: true },
      { key: 'modalidad', label: 'Modalidad', type: 'select', options: ['presencial', 'virtual', 'hibrida'], required: true },
      { key: 'duracion', label: 'Duración', required: true, min: 2, max: 120 },
      { key: 'temario', label: 'Temario', type: 'textarea', min: 2, max: 20000 },
      { key: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
      { key: 'imagen_url', label: 'URL de imagen', type: 'url', max: 2048 }, state] },
  servicios: { label: 'Servicios tecnológicos', singular: 'servicio', endpoint: 'servicios', icon: 'tools', catalog: true, title: 'titulo',
    description: 'Administra las soluciones tecnológicas que ofrece Horus.', states,
    fields: [title, slug, description, { key: 'categoria', label: 'Categoría', type: 'select', options: ['cableado', 'camaras', 'soporte', 'asesoramiento', 'otros'], required: true },
      { key: 'alcance', label: 'Alcance del servicio', type: 'textarea', min: 2, max: 20000 },
      { key: 'imagen_url', label: 'URL de imagen', type: 'url', max: 2048 }, state] },
  faq: { label: 'Preguntas frecuentes', singular: 'pregunta', endpoint: 'preguntas-frecuentes', icon: 'help', catalog: true, title: 'pregunta',
    description: 'Mantén respuestas claras y actualizadas para tus visitantes.', states,
    fields: [{ key: 'pregunta', label: 'Pregunta', required: true, min: 2, max: 300 },
      { key: 'respuesta', label: 'Respuesta', type: 'textarea', required: true, min: 3, max: 12000 },
      { key: 'categoria', label: 'Categoría', required: true, min: 2, max: 100 },
      { key: 'orden', label: 'Orden', type: 'number', min: 0, max: 1000000 }, state] },
  contenido: { label: 'Biblioteca de contenido', singular: 'contenido', endpoint: 'items', icon: 'file', title: 'titulo',
    description: 'Conserva y organiza los elementos de tu biblioteca administrativa.', states: ['activo', 'inactivo'],
    fields: [{ ...title, min: 3, max: 150 }, { ...description, max: 5000 },
      { key: 'categoria', label: 'Categoría', type: 'select', options: ['general', 'servicio', 'contenido'], required: true },
      { ...state, options: ['activo', 'inactivo'] }] },
  galeria: { label: 'Galería de proyectos', singular: 'imagen', endpoint: 'galeria', icon: 'image', title: 'titulo',
    description: 'Organiza las imágenes de tus proyectos y actividades.', states: ['activo', 'inactivo'],
    fields: [{ ...title, max: 150 }, { ...description, required: false },
      { key: 'categoria', label: 'Categoría', required: true, min: 2, max: 50 },
      { key: 'imagen_url', label: 'URL o ruta de imagen', required: true, min: 3, max: 500 },
      { key: 'orden', label: 'Orden', type: 'number', min: 0 },
      { key: 'activo', label: 'Visibilidad', type: 'select', options: ['activo', 'inactivo'], required: true }] },
  mensajes: { label: 'Bandeja de mensajes', singular: 'mensaje', endpoint: 'messages', icon: 'mail', title: 'asunto',
    description: 'Consulta las solicitudes recibidas y actualiza su atención.', states: ['nuevo', 'en_proceso', 'atendido'],
    fields: [{ key: 'nombre', label: 'Nombre', required: true, min: 2, max: 100 },
      { key: 'email', label: 'Correo electrónico', type: 'email', required: true },
      { key: 'telefono', label: 'Teléfono', min: 6, max: 30 },
      { key: 'asunto', label: 'Asunto', required: true, min: 3, max: 150 },
      { key: 'mensaje', label: 'Mensaje', type: 'textarea', required: true, min: 3, max: 5000 }] },
};
export const labels: Record<string, string> = { en_proceso: 'En proceso', capacitacion: 'Capacitación', hibrida: 'Híbrida', camaras: 'Cámaras', publicado: 'Publicado', borrador: 'Borrador', archivado: 'Archivado', activo: 'Activo', inactivo: 'Inactivo', nuevo: 'Nuevo', atendido: 'Atendido' };
export const label = (value: unknown) => labels[String(value)] || String(value ?? '').replace(/_/g, ' ');
export const rowState = (row: Row) => row.activo !== undefined ? row.activo ? 'activo' : 'inactivo' : String(row.estado || 'nuevo');
