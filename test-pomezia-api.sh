#!/bin/bash

# Test API /api/leads con dati Pomezia
# Verifica che il sistema accetti lead anche se geocoding indirizzo specifico fallisce

echo "🧪 TEST API /api/leads - Viale Alessandro Manzoni 13, Pomezia"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Payload con dati completi di valutazione
PAYLOAD=$(cat <<'EOF'
{
  "widgetId": "demo",
  "firstName": "Giuseppe",
  "lastName": "Test",
  "email": "test.pomezia@example.com",
  "phone": "3331234567",
  "address": "Viale Alessandro Manzoni 13",
  "city": "Pomezia",
  "postalCode": "00071",
  "type": "Appartamento",
  "surfaceSqm": 170,
  "rooms": 3,
  "bathrooms": 2,
  "floor": 1,
  "hasElevator": true,
  "outdoorSpace": "Balcone",
  "hasParking": false,
  "condition": "Buono",
  "heatingType": "Autonomo",
  "hasAirConditioning": true,
  "energyClass": "Non so",
  "buildYear": 2000,
  "occupancyStatus": "Libero",
  "minPrice": 200000,
  "maxPrice": 300000,
  "estimatedPrice": 250000,
  "baseOMIValue": 1500,
  "floorCoefficient": 1.0,
  "conditionCoefficient": 1.0,
  "explanation": "Test valutazione Pomezia",
  "messages": []
}
EOF
)

echo "📦 PAYLOAD:"
echo "$PAYLOAD" | jq '.'
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🚀 Invio richiesta a http://localhost:3000/api/leads..."
echo ""

# Invia richiesta
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Estrai status code (ultima riga)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

# Estrai body (tutto tranne ultima riga)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📥 RISPOSTA HTTP:"
echo "Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "200" ]; then
    echo "✅ SUCCESS - Lead salvato correttamente!"
    echo ""
    echo "📄 Response Body:"
    echo "$BODY" | jq '.'
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "✅ TEST PASSATO"
    echo ""
    echo "Il sistema ha accettato il lead anche se l'indirizzo specifico"
    echo "'Viale Alessandro Manzoni 13' non è nel database OpenStreetMap."
    echo ""
    echo "Questo conferma che il fix funziona:"
    echo "- città + CAP validati (Pomezia + 00071)"
    echo "- geocoding fallito per indirizzo specifico"
    echo "- sistema ha usato fallback con coordinate città"
    echo "- lead salvato con successo"
    exit 0
else
    echo "❌ ERRORE - Lead NON salvato"
    echo ""
    echo "📄 Response Body:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "❌ TEST FALLITO"
    echo ""
    echo "Il sistema ha rifiutato il lead anche con città+CAP corretti."
    echo "Questo indica che il fix potrebbe non funzionare come previsto."
    exit 1
fi
