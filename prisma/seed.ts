import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inizio seeding database...')

  // 1. Crea Agenzia Demo
  console.log('📍 Creazione agenzia demo...')

  const hashedPassword = await bcrypt.hash('demo123456', 10)

  const agency = await prisma.agency.upsert({
    where: { email: 'demo@mainstream.agency' },
    update: {},
    create: {
      nome: 'Mainstream Real Estate',
      email: 'demo@mainstream.agency',
      password: hashedPassword,
      citta: 'Milano',
      widgetId: nanoid(12),
      piano: 'premium',
      attiva: true,
    },
  })

  console.log(`✅ Agenzia creata: ${agency.nome} (${agency.email})`)
  console.log(`🔑 Password: demo123456`)
  console.log(`🎨 Widget ID: ${agency.widgetId}`)

  // 2. Crea Lead con dati completi
  console.log('\n📋 Creazione lead di esempio...')

  // Lead 1: Appartamento Milano Centro - COMPLETO
  const lead1 = await prisma.lead.create({
    data: {
      agenziaId: agency.id,
      nome: 'Marco',
      cognome: 'Rossi',
      email: 'marco.rossi@example.com',
      telefono: '+39 340 1234567',
      dataRichiesta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 giorni fa
    },
  })

  await prisma.property.create({
    data: {
      leadId: lead1.id,
      indirizzo: 'Via Montenapoleone 12',
      citta: 'Milano',
      cap: '20121',
      latitudine: 45.4685,
      longitudine: 9.1948,
      tipo: 'Appartamento',
      superficieMq: 120,
      piano: 3,
      ascensore: true,
      stato: 'Ottimo',
    },
  })

  await prisma.valuation.create({
    data: {
      immobileId: (await prisma.property.findUnique({ where: { leadId: lead1.id } }))!.id,
      prezzoMinimo: 850000,
      prezzoMassimo: 950000,
      prezzoStimato: 900000,
      valoreOmiBase: 7500,
      coefficientePiano: 1.15,
      coefficienteStato: 1.10,
      spiegazione: 'Appartamento in zona prestigiosa di Milano, Quadrilatero della Moda. Il valore al mq di €7.500 è stato corretto con un coefficiente di +15% per il piano alto e +10% per l\'ottimo stato di conservazione. La posizione centrale e i servizi nelle vicinanze giustificano il prezzo stimato di €900.000.',
    },
  })

  await prisma.conversation.create({
    data: {
      leadId: lead1.id,
      messaggi: [
        {
          id: '1',
          role: 'bot',
          text: 'Ciao! Sono l\'assistente virtuale di Mainstream Real Estate. Ti aiuterò a valutare il tuo immobile.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          role: 'user',
          text: 'Marco',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000).toISOString(),
        },
        {
          id: '3',
          role: 'bot',
          text: 'Grazie Marco! Qual è il tuo cognome?',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 35000).toISOString(),
        },
        {
          id: '4',
          role: 'user',
          text: 'Rossi',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        },
      ],
    },
  })

  console.log(`✅ Lead 1 creato: ${lead1.nome} ${lead1.cognome} - Appartamento Milano Centro`)

  // Lead 2: Villa Monza - COMPLETO
  const lead2 = await prisma.lead.create({
    data: {
      agenziaId: agency.id,
      nome: 'Laura',
      cognome: 'Bianchi',
      email: 'laura.bianchi@example.com',
      telefono: '+39 348 9876543',
      dataRichiesta: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 giorni fa
    },
  })

  await prisma.property.create({
    data: {
      leadId: lead2.id,
      indirizzo: 'Via Libertà 45',
      citta: 'Monza',
      cap: '20900',
      latitudine: 45.5845,
      longitudine: 9.2744,
      tipo: 'Villa',
      superficieMq: 250,
      piano: 0,
      ascensore: false,
      stato: 'Buono',
    },
  })

  await prisma.valuation.create({
    data: {
      immobileId: (await prisma.property.findUnique({ where: { leadId: lead2.id } }))!.id,
      prezzoMinimo: 650000,
      prezzoMassimo: 750000,
      prezzoStimato: 700000,
      valoreOmiBase: 2800,
      coefficientePiano: 1.0,
      coefficienteStato: 1.0,
      spiegazione: 'Villa indipendente a Monza in zona residenziale tranquilla. Il valore al mq di €2.800 riflette il mercato locale. Lo stato buono non richiede correzioni particolari. La metratura generosa e la presenza di giardino privato rendono questa proprietà molto appetibile per famiglie.',
    },
  })

  await prisma.conversation.create({
    data: {
      leadId: lead2.id,
      messaggi: [
        {
          id: '1',
          role: 'bot',
          text: 'Benvenuto! Come posso aiutarti oggi?',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  })

  console.log(`✅ Lead 2 creato: ${lead2.nome} ${lead2.cognome} - Villa Monza`)

  // Lead 3: Ufficio Roma - COMPLETO
  const lead3 = await prisma.lead.create({
    data: {
      agenziaId: agency.id,
      nome: 'Giuseppe',
      cognome: 'Verdi',
      email: 'giuseppe.verdi@example.com',
      telefono: '+39 335 5551234',
      dataRichiesta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 giorno fa
    },
  })

  await prisma.property.create({
    data: {
      leadId: lead3.id,
      indirizzo: 'Via del Corso 200',
      citta: 'Roma',
      cap: '00186',
      latitudine: 41.9028,
      longitudine: 12.4964,
      tipo: 'Ufficio',
      superficieMq: 85,
      piano: 2,
      ascensore: true,
      stato: 'Nuovo',
    },
  })

  await prisma.valuation.create({
    data: {
      immobileId: (await prisma.property.findUnique({ where: { leadId: lead3.id } }))!.id,
      prezzoMinimo: 480000,
      prezzoMassimo: 550000,
      prezzoStimato: 515000,
      valoreOmiBase: 5500,
      coefficientePiano: 1.05,
      coefficienteStato: 1.10,
      spiegazione: 'Ufficio in posizione strategica nel cuore di Roma, Via del Corso. Il valore al mq di €5.500 è stato incrementato del 5% per il piano intermedio comodo e del 10% per lo stato nuovo/ristrutturato. Ottimo per attività commerciali o professionali.',
    },
  })

  await prisma.conversation.create({
    data: {
      leadId: lead3.id,
      messaggi: [
        {
          id: '1',
          role: 'bot',
          text: 'Buongiorno! Vuoi una valutazione del tuo immobile?',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  })

  console.log(`✅ Lead 3 creato: ${lead3.nome} ${lead3.cognome} - Ufficio Roma`)

  // Lead 4: Appartamento da Ristrutturare Bologna - PARZIALE (solo contatti)
  const lead4 = await prisma.lead.create({
    data: {
      agenziaId: agency.id,
      nome: 'Francesca',
      cognome: 'Colombo',
      email: 'francesca.colombo@example.com',
      telefono: '+39 347 1122334',
      dataRichiesta: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 ore fa
    },
  })

  console.log(`✅ Lead 4 creato: ${lead4.nome} ${lead4.cognome} - Solo contatti (conversazione in corso)`)

  // Lead 5: Attico Torino - COMPLETO CON ALTA VALUTAZIONE
  const lead5 = await prisma.lead.create({
    data: {
      agenziaId: agency.id,
      nome: 'Alessandro',
      cognome: 'Ferrari',
      email: 'alessandro.ferrari@example.com',
      telefono: '+39 333 9998877',
      dataRichiesta: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 giorni fa
    },
  })

  await prisma.property.create({
    data: {
      leadId: lead5.id,
      indirizzo: 'Corso Vittorio Emanuele II 80',
      citta: 'Torino',
      cap: '10121',
      latitudine: 45.0703,
      longitudine: 7.6869,
      tipo: 'Appartamento',
      superficieMq: 180,
      piano: 8,
      ascensore: true,
      stato: 'Ottimo',
    },
  })

  await prisma.valuation.create({
    data: {
      immobileId: (await prisma.property.findUnique({ where: { leadId: lead5.id } }))!.id,
      prezzoMinimo: 720000,
      prezzoMassimo: 820000,
      prezzoStimato: 770000,
      valoreOmiBase: 3800,
      coefficientePiano: 1.25,
      coefficienteStato: 1.10,
      spiegazione: 'Attico panoramico all\'ottavo piano nel centro storico di Torino. Il valore al mq di €3.800 è stato significativamente incrementato (+25%) per l\'ultimo piano con vista eccezionale e ulteriore +10% per l\'ottimo stato. Finiture di pregio e luminosità eccellente.',
    },
  })

  await prisma.conversation.create({
    data: {
      leadId: lead5.id,
      messaggi: [
        {
          id: '1',
          role: 'bot',
          text: 'Ciao! Ti aiuto a valutare il tuo immobile.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  })

  console.log(`✅ Lead 5 creato: ${lead5.nome} ${lead5.cognome} - Attico Torino`)

  console.log('\n✨ Seeding completato con successo!')
  console.log('\n📊 Riepilogo:')
  console.log(`   - 1 Agenzia: ${agency.nome}`)
  console.log(`   - 5 Lead totali`)
  console.log(`   - 4 Lead con valutazione completa`)
  console.log(`   - 1 Lead solo contatti (conversazione in corso)`)
  console.log('\n🔑 Credenziali Login:')
  console.log(`   Email: demo@mainstream.agency`)
  console.log(`   Password: demo123456`)
  console.log(`\n🎨 Widget ID: ${agency.widgetId}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Errore durante il seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
