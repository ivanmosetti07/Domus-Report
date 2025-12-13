'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SendEmailButtonProps {
  leadId: string
  defaultEmail: string
  propertyAddress: string
}

export function SendEmailButton({ leadId, defaultEmail, propertyAddress }: SendEmailButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail)
  const [customMessage, setCustomMessage] = useState('')
  const [sendCopy, setSendCopy] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    try {
      setIsSending(true)

      if (!recipientEmail) {
        toast({
          title: 'Errore',
          description: 'Inserisci un indirizzo email',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch('/api/reports/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          recipientEmail,
          customMessage: customMessage || undefined,
          sendCopyToSender: sendCopy,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio dell\'email')
      }

      toast({
        title: 'Email inviata con successo',
        description: `Il report è stato inviato a ${recipientEmail}`,
      })

      setIsOpen(false)
      setRecipientEmail(defaultEmail)
      setCustomMessage('')
      setSendCopy(false)
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Impossibile inviare l\'email',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Mail className="w-4 h-4" />
          Invia via Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invia Report via Email</DialogTitle>
          <DialogDescription>
            Invia il report di valutazione dell'immobile in {propertyAddress} via email
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email destinatario *</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Messaggio personalizzato (opzionale)</Label>
            <Textarea
              id="message"
              placeholder="Aggiungi un messaggio personalizzato per il cliente..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-foreground-muted">
              Questo messaggio verrà incluso nell'email prima del report
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendCopy"
              checked={sendCopy}
              onChange={(e) => setSendCopy(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label
              htmlFor="sendCopy"
              className="text-sm font-normal cursor-pointer"
            >
              Invia una copia a me
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSending}
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !recipientEmail}
          >
            {isSending ? 'Invio in corso...' : 'Invia Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
