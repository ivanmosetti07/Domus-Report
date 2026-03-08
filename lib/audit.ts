import { prisma } from './prisma'
import { createLogger } from './logger'

const logger = createLogger('audit')

interface AuditLogData {
  agencyId?: string
  action: string
  entityType: string
  entityId?: string
  oldValue?: any
  newValue?: any
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry
 * Used for tracking important actions like login, logout, data changes, etc.
 * Helps with GDPR compliance and security monitoring
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        agencyId: data.agencyId || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : null,
        newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    })
  } catch (error) {
    logger.error('Error creating audit log', error)
    throw error
  }
}

