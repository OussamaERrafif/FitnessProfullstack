/**
 * API Error Handler
 * Centralized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export type ApiError = {
  code: string
  message: string
  details?: unknown
  statusCode: number
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Error to API response mapping
 */
export function errorToApiResponse(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.issues,
        statusCode: 400
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  // Custom application errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
        statusCode: 400
      },
      { status: 400 }
    )
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        code: 'AUTHENTICATION_ERROR',
        message: error.message,
        statusCode: 401
      },
      { status: 401 }
    )
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        code: 'AUTHORIZATION_ERROR',
        message: error.message,
        statusCode: 403
      },
      { status: 403 }
    )
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        code: 'NOT_FOUND',
        message: error.message,
        statusCode: 404
      },
      { status: 404 }
    )
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        code: 'CONFLICT',
        message: error.message,
        statusCode: 409
      },
      { status: 409 }
    )
  }

  if (error instanceof RateLimitError) {
    return NextResponse.json(
      {
        code: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
        statusCode: 429
      },
      { status: 429 }
    )
  }

  // Generic Error
  if (error instanceof Error) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An unexpected error occurred',
        statusCode: 500
      },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500
    },
    { status: 500 }
  )
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: PrismaClientKnownRequestError): NextResponse<ApiError> {
  switch (error.code) {
    case 'P2002':
      return NextResponse.json(
        {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this information already exists',
          details: error.meta,
          statusCode: 409
        },
        { status: 409 }
      )

    case 'P2025':
      return NextResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The requested record was not found',
          statusCode: 404
        },
        { status: 404 }
      )

    case 'P2003':
      return NextResponse.json(
        {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Cannot delete record due to related data',
          statusCode: 400
        },
        { status: 400 }
      )

    case 'P2011':
      return NextResponse.json(
        {
          code: 'NULL_CONSTRAINT',
          message: 'Required field is missing',
          details: error.meta,
          statusCode: 400
        },
        { status: 400 }
      )

    default:
      return NextResponse.json(
        {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          statusCode: 500
        },
        { status: 500 }
      )
  }
}

/**
 * API route wrapper with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return errorToApiResponse(error)
    }
  }
}

/**
 * Async handler wrapper
 */
export function asyncHandler(
  fn: (req: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return (req: NextRequest, context?: unknown) => {
    return Promise.resolve(fn(req, context)).catch((error) => {
      return errorToApiResponse(error)
    })
  }
}

/**
 * Validate request data with Zod schema
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request data', error.issues)
    }
    throw new ValidationError('Invalid JSON in request body')
  }
}

/**
 * Check authentication from headers or cookies
 */
export function requireAuth(req: NextRequest): { userId: string; role: string } {
  // Implement your authentication logic here
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader) {
    throw new AuthenticationError('Authorization header required')
  }
  
  // For example purposes - implement actual JWT verification
  // const token = authHeader.replace('Bearer ', '')
  // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
  
  // Placeholder return
  throw new AuthenticationError('Authentication not implemented')
}

/**
 * Check if user has required permissions
 */
export function requirePermission(userRole: string, requiredRole: string): void {
  const roleHierarchy = ['client', 'trainer', 'admin']
  const userLevel = roleHierarchy.indexOf(userRole)
  const requiredLevel = roleHierarchy.indexOf(requiredRole)
  
  if (userLevel < requiredLevel) {
    throw new AuthorizationError('Insufficient permissions for this action')
  }
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): void {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const record = rateLimitMap.get(identifier)
  
  if (!record || record.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return
  }
  
  if (record.count >= maxRequests) {
    throw new RateLimitError(`Rate limit exceeded. Max ${maxRequests} requests per ${windowMs}ms`)
  }
  
  record.count++
}
