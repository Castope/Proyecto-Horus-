import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe estar configurado y tener al menos 32 caracteres.');
  }

  return secret;
};

export const createAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: '8h', issuer: 'horus-api', audience: 'horus-panel' });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, getJwtSecret(), { issuer: 'horus-api', audience: 'horus-panel' }) as JwtPayload;
