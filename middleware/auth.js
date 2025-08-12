/**
 * Minimal auth middleware to allow the server to boot and protected routes to work in demo.
 * Replace with proper JWT verification in production.
 */

module.exports = function authenticateRequest(req, res, next) {
  // In a real app, verify JWT here and populate req.user from token claims
  const authorizationHeader = req.headers.authorization || ''

  if (authorizationHeader.startsWith('Bearer ')) {
    // Skipping token verification intentionally for demo purposes
    req.user = {
      id: 'demo-user-id',
      email: 'demo@example.com',
    }
  } else {
    // Provide a default demo user to keep flows unblocked
    req.user = {
      id: 'demo-user-id',
      email: 'demo@example.com',
    }
  }

  if (process.env.NODE_ENV === 'production') {
    // Surface a warning if this stub middleware is used in production
    console.warn('[auth] Using demo auth middleware in production. Replace with real JWT verification.')
  }

  next()
}


