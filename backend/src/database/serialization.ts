import { Prisma } from '@prisma/client';

// Preserve MySQL DATEONLY and DECIMAL representations in API responses.
export function serializeQuote<T extends { validez: Date }>(item: T) {
  const result = { ...item, validez: item.validez.toISOString().slice(0, 10) };
  for (const field of ['subtotal', 'descuento', 'tasa', 'impuesto', 'total']) {
    if (item[field] instanceof Prisma.Decimal) result[field] = item[field].toFixed(2);
  }
  return result;
}
export function serializeComplaint<T extends { fecha_incidente: Date }>(item: T) {
  return { ...item, fecha_incidente: item.fecha_incidente.toISOString().slice(0, 10) };
}
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
