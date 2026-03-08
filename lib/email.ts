import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    encoding?: string
  }>
}

// Sanitizza il display name per evitare header email non validi
// (es. nomi agenzia con virgolette, newline o caratteri speciali)
export function sanitizeEmailDisplayName(name: string): string {
  return name.replace(/["\r\n]/g, ' ').trim()
}

export function formatEmailAddress(name: string, email: string): string {
  return `"${sanitizeEmailDisplayName(name)}" <${email}>`
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP configuration missing:', {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASSWORD
      })
      throw new Error('Configurazione SMTP mancante')
    }

    const port = parseInt(process.env.SMTP_PORT || '465')

    // Deterine secure mode: explicitly from env, or automatically from port
    // Port 465 is usually implicit SSL, 587 is STARTTLS (secure: false)
    const isSecure = process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Increase timeout for serverless environments
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

    const mailOptions = {
      from: fromEmail,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: att.encoding || 'base64',
      })),
    }

    console.log(`Sending email to: ${mailOptions.to}, subject: ${mailOptions.subject}, from: ${mailOptions.from}`)

    const result = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', result.messageId)

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error('Email send error:', {
      error: error instanceof Error ? error.message : String(error),
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore nell\'invio dell\'email',
    }
  }
}
