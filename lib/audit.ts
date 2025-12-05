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

/**
 * Get audit logs for an agency
 * Used for displaying activity history in the dashboard
 */
export async function getAuditLogs(agencyId: string, limit: number = 50, offset: number = 0) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.auditLog.count({
      where: { agencyId },
    })

    return { logs, total }
  } catch (error) {
    logger.error('Error fetching audit logs', error)
    throw error
  }
}

/**
 * Clean up old audit logs (GDPR compliance)
 * Call this periodically (e.g., via cron) to delete logs older than the retention period
 */
export async function cleanupOldAuditLogs(retentionDays: number = 365) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    return { deletedCount: result.count }
  } catch (error) {
    logger.error('Error cleaning up audit logs', error)
    throw error
  }
}
