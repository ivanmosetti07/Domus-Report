export const REFERRAL_COOKIE_NAME = 'domus_ref'
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 giorni in secondi

export function generateReferralUrl(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.it'
  return `${baseUrl}?ref=${code}`
}
