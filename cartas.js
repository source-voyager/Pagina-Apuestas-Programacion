// ============================================
// cartas.js
// Mazo de cartas para Hold'em y Blackjack.
// ============================================

const PALOS = ["♠", "♥", "♦", "♣"];
const NOMBRES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

// crea las 52 cartas. "valor" va de 2 a 14 (la A vale 14)
function crearMazo() {
  const mazo = [];
  for (let p = 0; p < PALOS.length; p++) {
    for (let n = 0; n < NOMBRES.length; n++) {
      mazo.push({ nombre: NOMBRES[n], valor: n + 2, palo: PALOS[p] });
    }
  }
  return mazo;
}

// mezcla el mazo (método de Fisher-Yates)
function barajar(mazo) {
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporal = mazo[i];
    mazo[i] = mazo[j];
    mazo[j] = temporal;
  }
  return mazo;
}

// crea el <div> de una carta para ponerlo en la página
function dibujarCarta(carta, tapada) {
  const div = document.createElement("div");

  if (tapada) {
    div.className = "carta tapada";
    div.textContent = "🂠";
    return div;
  }

  const esRoja = (carta.palo === "♥" || carta.palo === "♦");
  div.className = "carta " + (esRoja ? "roja" : "negra");
  div.textContent = carta.nombre + carta.palo;
  return div;
}
