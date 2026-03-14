import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUnsubscribeToken } from '@/lib/email-marketing'

// GET /api/email/unsubscribe?email=xxx&token=yyy — Disiscrive l'utente dalle email marketing
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const token = request.nextUrl.searchParams.get('token')

    if (!email || !token) {
      return new NextResponse(unsubscribePage('Parametri mancanti.', false), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    // Verifica token HMAC
    if (!verifyUnsubscribeToken(email, token)) {
      return new NextResponse(unsubscribePage('Link non valido o scaduto.', false), {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    // Crea record unsubscribe (upsert per evitare duplicati)
    await prisma.emailUnsubscribe.upsert({
      where: { email },
      update: {},
      create: { email }
    })

    // Cancella tutte le email pending per questa email
    const cancelled = await prisma.emailSend.updateMany({
      where: {
        recipientEmail: email,
        status: 'pending'
      },
      data: { status: 'cancelled' }
    })

    console.log(`[unsubscribe] ${email} unsubscribed, ${cancelled.count} pending emails cancelled`)

    return new NextResponse(unsubscribePage('Sei stato disiscritto con successo.', true), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (error) {
    console.error('[unsubscribe] Error:', error)
    return new NextResponse(unsubscribePage('Si è verificato un errore. Riprova più tardi.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}

function unsubscribePage(message: string, success: boolean): string {
  const color = success ? '#16a34a' : '#dc2626'
  const icon = success ? '&#10003;' : '&#10007;'

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Disiscriviti - Domus Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 12px; padding: 40px; max-width: 420px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .icon { width: 64px; height: 64px; border-radius: 50%; background: ${color}15; color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
    h1 { font-size: 20px; color: #111; margin: 0 0 12px; }
    p { font-size: 14px; color: #6b7280; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${message}</h1>
    <p>Non riceverai più email di marketing da Domus Report.</p>
  </div>
</body>
</html>`
}
