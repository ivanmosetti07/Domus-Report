
function hexToRgb(hex: string): [number, number, number] {
    // Rimuovi # se presente
    if (!hex) return [37, 99, 235];
    hex = hex.replace(/^#/, '');

    // Se è a 3 cifre, espandilo a 6 (es. "000" -> "000000")
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || hex.length !== 6) {
        return [37, 99, 235]; // Default blue-600
    }

    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}

console.log("#000 ->", JSON.stringify(hexToRgb("#000"))); // [0, 0, 0]
console.log("#fff ->", JSON.stringify(hexToRgb("#fff"))); // [255, 255, 255]
console.log("#ff0000 ->", JSON.stringify(hexToRgb("#ff0000"))); // [255, 0, 0]
console.log("3763eb ->", JSON.stringify(hexToRgb("3763eb"))); // [55, 99, 235]
console.log("invalid ->", JSON.stringify(hexToRgb("invalid"))); // [37, 99, 235]
