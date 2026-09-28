import { isIP } from 'node:net';

// Empty by default. Never trust every source or a user-controlled hop count.
export function trustedProxies(value: unknown): string[] | false {
  if (value === undefined || value === '') return false;
  if (typeof value !== 'string') throw new Error('TRUSTED_PROXY_CIDRS debe contener IPs o CIDRs explícitos.');
  const addresses = value.split(/[\s,]+/).filter(Boolean);
  if (!addresses.length) return false;
  for (const address of addresses) {
    const [ip, prefix, extra] = address.split('/');
    const version = isIP(ip);
    if (!version || extra !== undefined || (prefix !== undefined &&
      (!/^\d+$/.test(prefix) || Number(prefix) < 1 || Number(prefix) > (version === 4 ? 32 : 128)))) {
      throw new Error('TRUSTED_PROXY_CIDRS debe contener IPs o CIDRs explícitos, sin comodines ni /0.');
    }
  }
  return addresses;
}
