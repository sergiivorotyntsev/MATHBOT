/**
 * Authentication Middleware
 *
 * MVP: Simple password-based admin gate
 * TODO: Replace with proper JWT/session-based auth + RBAC
 */

import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  isAdmin?: boolean;
  userId?: string;
}

/**
 * Admin authentication middleware
 * Checks for ADMIN_PASSWORD in Authorization header
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin authentication required',
    });
  }

  // Extract password from "Bearer <password>" format
  const [scheme, password] = authHeader.split(' ');

  if (scheme !== 'Bearer') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization scheme. Use Bearer authentication',
    });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('[SECURITY] ADMIN_PASSWORD not set in environment variables');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Admin authentication not configured',
    });
  }

  if (password !== adminPassword) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid admin credentials',
    });
  }

  req.isAdmin = true;
  next();
}

/**
 * Optional authentication middleware
 * Sets userId if provided, but doesn't require it
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;

  if (userId) {
    req.userId = userId;
  }

  next();
}

/**
 * Required user authentication middleware
 * Requires x-user-id header (for now)
 * TODO: Replace with proper session/JWT validation
 */
export function requireUser(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'User ID required (x-user-id header)',
    });
  }

  req.userId = userId;
  next();
}
