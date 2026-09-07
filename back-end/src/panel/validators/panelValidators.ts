export class ValidationError extends Error {}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIAS = ['general', 'servicio', 'contenido'];
const ESTADOS = ['activo', 'inactivo'];
const ESTADOS_MENSAJE = ['nuevo', 'en_proceso', 'atendido'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const requiredText = (value: unknown, field: string, min: number, max: number): string => {
  if (typeof value !== 'string') throw new ValidationError(`${field} debe ser texto.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new ValidationError(`${field} debe tener entre ${min} y ${max} caracteres.`);
  }
  return normalized;
};

export const validateCredentials = (body: unknown, registering: boolean) => {
  if (!isRecord(body)) throw new ValidationError('El cuerpo de la solicitud no es válido.');
  const email = requiredText(body.email, 'Email', 5, 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ValidationError('Email no tiene un formato válido.');
  const password = requiredText(body.password, 'Contraseña', 8, 72);

  return {
    email,
    password,
    ...(registering ? { nombre: requiredText(body.nombre, 'Nombre', 2, 100) } : {}),
  };
};

export interface ItemInput {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  estado?: string;
}

export interface CreateItemInput {
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
}

export function validateItem(body: unknown, partial: true): ItemInput;
export function validateItem(body: unknown, partial?: false): CreateItemInput;
export function validateItem(body: unknown, partial = false): ItemInput | CreateItemInput {
  if (!isRecord(body)) throw new ValidationError('El cuerpo de la solicitud no es válido.');
  const result: ItemInput = {};
  const fields = ['titulo', 'descripcion', 'categoria', 'estado'];
  if (partial && !fields.some((field) => body[field] !== undefined)) {
    throw new ValidationError('Indica al menos un campo para actualizar.');
  }

  if (!partial || body.titulo !== undefined) result.titulo = requiredText(body.titulo, 'Título', 3, 150);
  if (!partial || body.descripcion !== undefined) result.descripcion = requiredText(body.descripcion, 'Descripción', 3, 5000);
  if (body.categoria !== undefined) {
    const categoria = requiredText(body.categoria, 'Categoría', 3, 50).toLowerCase();
    if (!CATEGORIAS.includes(categoria)) throw new ValidationError('Categoría no permitida.');
    result.categoria = categoria;
  } else if (!partial) result.categoria = 'general';
  if (body.estado !== undefined) {
    const estado = requiredText(body.estado, 'Estado', 5, 20).toLowerCase();
    if (!ESTADOS.includes(estado)) throw new ValidationError('Estado no permitido.');
    result.estado = estado;
  } else if (!partial) result.estado = 'activo';

  return result as ItemInput | CreateItemInput;
}

export const validateId = (value: string): number => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ValidationError('El id debe ser un entero positivo.');
  return id;
};

export const validateMessage = (body: unknown) => {
  if (!isRecord(body)) throw new ValidationError('El cuerpo de la solicitud no es válido.');
  const email = requiredText(body.email, 'Email', 5, 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ValidationError('Email no tiene un formato válido.');
  return {
    nombre: requiredText(body.nombre, 'Nombre', 2, 100),
    email,
    telefono: requiredText(body.telefono, 'Teléfono', 6, 30),
    asunto: requiredText(body.asunto, 'Asunto', 3, 150),
    mensaje: requiredText(body.mensaje, 'Mensaje', 3, 5000),
  };
};

export const validateMessageStatus = (body: unknown): { estado: string } => {
  if (!isRecord(body) || typeof body.estado !== 'string') throw new ValidationError('El estado es obligatorio.');
  const estado = body.estado.trim().toLowerCase();
  if (!ESTADOS_MENSAJE.includes(estado)) throw new ValidationError('Estado de mensaje no permitido.');
  return { estado };
};
