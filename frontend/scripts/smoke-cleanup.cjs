const fs = require('node:fs'), path = require('node:path'), os = require('node:os');

// Registra el proceso concreto que este smoke acaba de crear. También se limpia si una aserción lanza.
module.exports = function registerSmokeCleanup(child, profile, server, killBrowser) {
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    if (child.pid) killBrowser(child);
    server.close();
    const target = path.resolve(profile), temporary = fs.realpathSync(os.tmpdir());
    // Solo el perfil propio, dentro del directorio temporal; nunca una ruta raíz o arbitraria.
    if (target.startsWith(temporary + path.sep) && path.basename(target).startsWith('horus-')) {
      try { fs.rmSync(target, { recursive: true, force: true }); } catch { /* Edge puede estar liberando el perfil. */ }
    }
  };
  process.once('exit', cleanup);
  process.once('SIGINT', () => process.exit(130));
  process.once('SIGTERM', () => process.exit(143));
  return cleanup;
};
