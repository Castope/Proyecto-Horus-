export function corsOrigins(env: Record<string, unknown>): string[] {
  const hosted = env.VERCEL === '1' || env.NODE_ENV === 'production';
  const raw = String(env.CORS_ORIGINS || (hosted ? '' : 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173'));
  const origins = raw.split(',').map(value => value.trim()).filter(Boolean);
  if (hosted && !origins.length) throw new Error('Configura CORS_ORIGINS con los orígenes HTTPS del frontend.');
  return origins.map(origin => {
    let url: URL;
    try { url = new URL(origin); } catch { throw new Error('CORS_ORIGINS contiene un origen inválido.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.origin !== origin ||
        url.username || url.password || (hosted && url.protocol !== 'https:')) {
      throw new Error('CORS_ORIGINS debe contener orígenes exactos, sin rutas ni barra final.');
    }
    return origin;
  });
}

export function validateDeployment(env: Record<string, unknown>) {
  const hosted = env.VERCEL === '1' || env.NODE_ENV === 'production';
  corsOrigins(env);
  if (hosted) {
    for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET']) {
      if (typeof env[key] !== 'string' || !String(env[key]).trim()) throw new Error('Falta configurar ' + key + ' en producción.');
    }
    if (String(env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
    if (['localhost', '127.0.0.1', '::1'].includes(String(env.DB_HOST).toLowerCase())) {
      throw new Error('DB_HOST debe ser un servidor MySQL accesible desde Vercel, no localhost.');
    }
    if (env.DB_SYNC === 'true') throw new Error('DB_SYNC debe estar desactivado en producción.');
  }
  return env;
}
