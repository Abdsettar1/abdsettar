import { Request, Response, NextFunction } from 'express';

export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  const secretKey = process.env.API_SECRET_KEY;

  if (!secretKey) {
    // If not configured, allow requests in development/preview
    return next();
  }

  const rawKey = typeof apiKey === 'string' && apiKey.startsWith('Bearer ') 
    ? apiKey.slice(7) 
    : apiKey;

  if (rawKey === secretKey) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
}
