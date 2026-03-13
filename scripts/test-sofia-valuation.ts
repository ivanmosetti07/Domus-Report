import { PrismaClient } from '@prisma/client'
import { calculateValuationLocal, calculateFloorCoefficient, calculateConditionCoefficient } from '../lib/valuation'

const prisma = new PrismaClient()

async function main() {
  const properties = await prisma.property.findMany({
    where: { lead_id: 'cmmnjnqor000m10ujbatcpod8' }, // ID di Sofia
    include: { valuation: true }
  })
  
  if (properties.length === 0) {
    console.log('Property not found');
    return;
  }
  
  const p = properties[0];
  const v = p.valuation;
  
  if (!v) {
    console.log('Valuation non trovata');
    return;
  }

  // Dati input
  const surface = p.superficieMq;
  const omiBase = v.valoreOmiBase;
  const floorCoef = v.coefficientePiano;
  const condCoef = v.coefficienteStato;
  const evalPr = v.prezzoStimato;

  console.log('DATI SALVATI NEL DB PER SOFIA SCARAMUZZA:');
  console.log(`- Superficie: ${surface} mq`);
  console.log(`- Valore OMI Base: ${omiBase} €/mq`);
  console.log(`- Coefficiente Piano: ${floorCoef}`);
  console.log(`- Coefficiente Stato: ${condCoef}`);
  console.log(`- Prezzo Stimato Salvato: ${evalPr} €`);
  
  const expectedMath = Math.round(surface * omiBase * floorCoef * condCoef);
  console.log(`- Calcolo Matematico Esatto (Superficie * OMI Base * Coef P * Coef S): ${expectedMath} €`);
  
  if (expectedMath !== evalPr) {
    console.log(`>> ERRORE MATEMATICO! ${expectedMath} != ${evalPr}`);
    const difference = evalPr - expectedMath;
    const ratio = evalPr / expectedMath;
    console.log(`>> Differenza: ${difference} €`);
    console.log(`>> Fattore di aggiustamento (tipico AI): ${ratio.toFixed(4)}`);
  } else {
    console.log('>> Il calcolo matematico corrisponde perfettamente ai coefficienti.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect() });
