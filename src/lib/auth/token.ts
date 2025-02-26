import { jwtVerify, SignJWT } from 'jose'
import type { AuthUser } from './types'
import { AuthError } from '@/lib/errors/AuthError'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key'
)

const JWT_ISSUER = 'test-management-app'
const JWT_AUDIENCE = 'test-management-users'

export async function validateToken(token: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })

    if (!payload.sub) {
      throw new AuthError(
        'Invalid token payload',
        'INVALID_TOKEN',
        401
      )
    }

    // TODO: Fetch user from database using payload.sub
    const user = {} as AuthUser // Temporary placeholder

    if (!user) {
      throw new AuthError(
        'User not found',
        'INVALID_TOKEN',
        401
      )
    }

    return user
  } catch (error) {
    throw new AuthError(
      'Invalid token',
      'INVALID_TOKEN',
      401
    )
  }
}

export async function generateToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('1h')
    .setSubject(user.id)
    .sign(JWT_SECRET)

  return token
} 