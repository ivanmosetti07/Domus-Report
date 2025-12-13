import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("leadId")

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId è richiesto" },
        { status: 400 }
      )
    }

    // Recupera il lead con tutti i dati correlati
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
        agenzia: true,
      },
    })

    if (!lead || !lead.property || !lead.property.valuation) {
      return NextResponse.json(
        { error: "Lead o valutazione non trovata" },
        { status: 404 }
      )
    }

    const { property, agenzia } = lead
    const valuation = property.valuation!

    // Crea il PDF
    const doc = new jsPDF()

    // Colori personalizzati
    const primaryColor: [number, number, number] = [37, 99, 235] // blu
    const textColor: [number, number, number] = [31, 41, 55] // grigio scuro

    // Header con logo agenzia (se disponibile)
    if (agenzia.logoUrl) {
      try {
        // Aggiungi il logo (se è un URL valido)
        doc.addImage(agenzia.logoUrl, "PNG", 15, 10, 30, 30)
      } catch (error) {
        console.error("Errore caricamento logo:", error)
      }
    }

    // Titolo agenzia
    doc.setFontSize(20)
    doc.setTextColor(...primaryColor)
    doc.text(agenzia.nome, agenzia.logoUrl ? 50 : 15, 20)

    // Info agenzia
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    let yPos = agenzia.logoUrl ? 30 : 30
    if (agenzia.indirizzo) {
      doc.text(`Indirizzo: ${agenzia.indirizzo}`, agenzia.logoUrl ? 50 : 15, yPos)
      yPos += 5
    }
    if (agenzia.telefono) {
      doc.text(`Tel: ${agenzia.telefono}`, agenzia.logoUrl ? 50 : 15, yPos)
      yPos += 5
    }
    if (agenzia.email) {
      doc.text(`Email: ${agenzia.email}`, agenzia.logoUrl ? 50 : 15, yPos)
      yPos += 5
    }
    if (agenzia.sitoWeb) {
      doc.text(`Sito: ${agenzia.sitoWeb}`, agenzia.logoUrl ? 50 : 15, yPos)
      yPos += 5
    }

    // Linea separatore
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(15, yPos + 5, 195, yPos + 5)

    // Titolo report
    yPos += 15
    doc.setFontSize(18)
    doc.setTextColor(...primaryColor)
    doc.text("REPORT VALUTAZIONE IMMOBILIARE", 105, yPos, { align: "center" })

    // Data valutazione
    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    const dataValutazione = new Date(valuation.dataCalcolo).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    doc.text(`Data: ${dataValutazione}`, 105, yPos, { align: "center" })

    // Sezione Cliente
    yPos += 15
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("DATI CLIENTE", 15, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.text(`Nome: ${lead.nome} ${lead.cognome}`, 15, yPos)
    yPos += 6
    doc.text(`Email: ${lead.email}`, 15, yPos)
    if (lead.telefono) {
      yPos += 6
      doc.text(`Telefono: ${lead.telefono}`, 15, yPos)
    }

    // Sezione Immobile
    yPos += 12
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("DATI IMMOBILE", 15, yPos)

    yPos += 8
    autoTable(doc, {
      startY: yPos,
      head: [["Caratteristica", "Dettaglio"]],
      body: [
        ["Indirizzo", `${property.indirizzo}, ${property.citta}`],
        ["Quartiere", property.quartiere || "N/D"],
        ["Tipologia", property.tipo],
        ["Superficie", `${property.superficieMq} mq`],
        ["Stanze/Camere", property.locali ? `${property.locali}` : "N/D"],
        ["Bagni", property.bagni ? `${property.bagni}` : "N/D"],
        ["Piano", property.piano !== null ? `${property.piano}${property.ascensore ? " (con ascensore)" : " (senza ascensore)"}` : "N/D"],
        ["Spazi Esterni", property.spaziEsterni || "Nessuno"],
        ["Posto Auto", property.postoAuto ? "Sì" : "No"],
        ["Stato", property.stato],
        ["Riscaldamento", property.riscaldamento || "N/D"],
        ["Aria Condizionata", property.ariaCondizionata ? "Sì" : "No"],
        ["Classe Energetica", property.classeEnergetica || "N/D"],
        ["Anno Costruzione", property.annoCostruzione ? `${property.annoCostruzione}` : "N/D"],
        ["Stato Occupazione", property.statoOccupazione || "N/D"],
      ],
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 120 },
      },
    })

    // Sezione Valutazione
    yPos = (doc as any).lastAutoTable.finalY + 15

    // Controlla se serve una nuova pagina
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("VALUTAZIONE", 15, yPos)

    yPos += 10

    // Box con il prezzo stimato (evidenziato)
    doc.setFillColor(37, 99, 235)
    doc.roundedRect(15, yPos, 180, 25, 3, 3, "F")
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text("STIMA DI MERCATO", 105, yPos + 10, { align: "center" })
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(
      `€ ${valuation.prezzoStimato.toLocaleString("it-IT")}`,
      105,
      yPos + 20,
      { align: "center" }
    )
    doc.setFont("helvetica", "normal")

    yPos += 30

    // Range di valutazione
    doc.setFontSize(11)
    doc.setTextColor(...textColor)
    doc.text(
      `Range di valutazione: € ${valuation.prezzoMinimo.toLocaleString("it-IT")} - € ${valuation.prezzoMassimo.toLocaleString("it-IT")}`,
      15,
      yPos
    )

    yPos += 10

    // Dettagli valutazione
    autoTable(doc, {
      startY: yPos,
      head: [["Parametro", "Valore"]],
      body: [
        ["Valore OMI Base", `€ ${valuation.valoreOmiBase.toLocaleString("it-IT")}`],
        ["Coefficiente Piano", `${valuation.coefficientePiano}`],
        ["Coefficiente Stato", `${valuation.coefficienteStato}`],
      ],
      theme: "plain",
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: textColor,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
    })

    // Spiegazione
    yPos = (doc as any).lastAutoTable.finalY + 10

    // Controlla se serve una nuova pagina
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text("Metodologia di Calcolo", 15, yPos)

    yPos += 8
    doc.setFontSize(9)
    doc.setTextColor(...textColor)

    // Splitta la spiegazione in righe per evitare overflow
    const spiegazione = valuation.spiegazione
    const maxWidth = 180
    const lines = doc.splitTextToSize(spiegazione, maxWidth)

    lines.forEach((line: string) => {
      if (yPos > 280) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 15, yPos)
      yPos += 5
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Pagina ${i} di ${pageCount}`,
        105,
        285,
        { align: "center" }
      )
      doc.text(
        "Questo documento è stato generato automaticamente da Domus Report",
        105,
        290,
        { align: "center" }
      )
    }

    // Genera il PDF come buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // Restituisci il PDF come risposta
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="valutazione-${lead.cognome}-${new Date().getTime()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[PDF Generation Error]", error)
    return NextResponse.json(
      { error: "Errore nella generazione del PDF" },
      { status: 500 }
    )
  }
}
