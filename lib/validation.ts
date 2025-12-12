/**
 * Validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove script tags content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove on* attributes (onclick, onerror, etc.)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    // Limit length
    .substring(0, 1000)
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeString(email).toLowerCase()

  if (!sanitized) {
    return { valid: false, sanitized: "", error: "Email è obbligatoria" }
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized, error: "Formato email non valido" }
  }

  // Check for suspicious patterns
  if (sanitized.includes("..") || sanitized.startsWith(".") || sanitized.endsWith(".")) {
    return { valid: false, sanitized, error: "Formato email non valido" }
  }

  if (sanitized.length > 254) {
    return { valid: false, sanitized, error: "Email troppo lunga" }
  }

  return { valid: true, sanitized }
}

/**
 * Validate phone number (Italian format)
 */
export function validatePhone(phone: string | undefined | null): { valid: boolean; sanitized: string | null; error?: string } {
  // Handle undefined or null
  if (!phone) {
    return { valid: true, sanitized: null } // Phone is optional
  }

  // Sanitize: remove spaces, dashes, dots, parentheses - keep only + and digits
  // This matches what the widget does before sending
  let sanitized = phone
    .trim()
    .replace(/\s/g, "")       // Remove spaces
    .replace(/-/g, "")        // Remove dashes
    .replace(/\./g, "")       // Remove dots
    .replace(/\(/g, "")       // Remove parentheses
    .replace(/\)/g, "")       // Remove parentheses

  if (!sanitized) {
    return { valid: true, sanitized: null } // Phone is optional
  }

  // Allow +39, 0039, or direct number
  // Should be 9-13 digits (aligned with widget regex)
  const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/

  if (!phoneRegex.test(sanitized)) {
    return { valid: false, sanitized: null, error: "Formato telefono non valido (es. +39 333 123 4567)" }
  }

  return { valid: true, sanitized }
}

/**
 * Validate name (first name or last name)
 */
export function validateName(name: string, fieldName: string = "Nome"): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeString(name)

  if (!sanitized) {
    return { valid: false, sanitized: "", error: `${fieldName} è obbligatorio` }
  }

  if (sanitized.length < 2) {
    return { valid: false, sanitized, error: `${fieldName} deve essere almeno 2 caratteri` }
  }

  if (sanitized.length > 50) {
    return { valid: false, sanitized, error: `${fieldName} troppo lungo` }
  }

  // Only letters, spaces, apostrophes, and hyphens
  const nameRegex = /^[a-zA-ZàèéìòùÀÈÉÌÒÙ\s'-]+$/

  if (!nameRegex.test(sanitized)) {
    return { valid: false, sanitized, error: `${fieldName} contiene caratteri non validi` }
  }

  return { valid: true, sanitized }
}

/**
 * Validate address
 */
export function validateAddress(address: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeString(address)

  if (!sanitized) {
    return { valid: false, sanitized: "", error: "Indirizzo è obbligatorio" }
  }

  if (sanitized.length < 5) {
    return { valid: false, sanitized, error: "Indirizzo troppo corto" }
  }

  if (sanitized.length > 200) {
    return { valid: false, sanitized, error: "Indirizzo troppo lungo" }
  }

  return { valid: true, sanitized }
}

/**
 * Validate city
 */
export function validateCity(city: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeString(city)

  if (!sanitized) {
    return { valid: false, sanitized: "", error: "Città è obbligatoria" }
  }

  if (sanitized.length < 2) {
    return { valid: false, sanitized, error: "Città troppo corta" }
  }

  if (sanitized.length > 100) {
    return { valid: false, sanitized, error: "Città troppo lunga" }
  }

  // Only letters, spaces, apostrophes, and hyphens
  const cityRegex = /^[a-zA-ZàèéìòùÀÈÉÌÒÙ\s'-]+$/

  if (!cityRegex.test(sanitized)) {
    return { valid: false, sanitized, error: "Città contiene caratteri non validi" }
  }

  return { valid: true, sanitized }
}

/**
 * Validate surface area (sqm)
 */
export function validateSurface(surface: number | string): { valid: boolean; value: number; error?: string } {
  const num = typeof surface === "string" ? parseFloat(surface) : surface

  if (isNaN(num)) {
    return { valid: false, value: 0, error: "Superficie deve essere un numero" }
  }

  if (num < 10) {
    return { valid: false, value: num, error: "Superficie minima 10 m²" }
  }

  if (num > 2000) {
    return { valid: false, value: num, error: "Superficie massima 2000 m²" }
  }

  return { valid: true, value: Math.round(num) }
}

/**
 * Validate floor number
 */
export function validateFloor(floor: number | string): { valid: boolean; value: number; error?: string } {
  const num = typeof floor === "string" ? parseInt(floor, 10) : floor

  if (isNaN(num)) {
    return { valid: false, value: 0, error: "Piano deve essere un numero" }
  }

  if (num < -1) {
    return { valid: false, value: num, error: "Piano minimo -1 (seminterrato)" }
  }

  if (num > 30) {
    return { valid: false, value: num, error: "Piano massimo 30" }
  }

  return { valid: true, value: num }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength: "weak" | "medium" | "strong" } {
  if (!password) {
    return { valid: false, error: "Password è obbligatoria", strength: "weak" }
  }

  if (password.length < 8) {
    return { valid: false, error: "Password deve essere almeno 8 caratteri", strength: "weak" }
  }

  if (password.length > 100) {
    return { valid: false, error: "Password troppo lunga", strength: "weak" }
  }

  // Check strength
  let strength: "weak" | "medium" | "strong" = "weak"
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

  if (password.length >= 8 && criteriaCount >= 2) {
    strength = "medium"
  }

  if (password.length >= 12 && criteriaCount >= 3) {
    strength = "strong"
  }

  return { valid: true, strength }
}

/**
 * Rate limiting helper - tracks requests by IP
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Check if IP has exceeded rate limit
 * @param ip - IP address
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 24 * 60 * 60 * 1000 // 24 hours
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    const resetAt = now + windowMs
    rateLimitStore.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  // Existing window
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (in order of preference)
  const headers = request.headers

  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIP = headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = headers.get("cf-connecting-ip") // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to a default (should not happen in production)
  return "unknown"
}
