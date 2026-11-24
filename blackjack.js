// ============================================
// blackjack.js
// Blackjack: tú contra el crupier.
// ============================================

const APUESTA = 500;

let mazo = [];
let cartasJugador = [];
let cartasCrupier = [];
let apuestaActual = APUESTA;
let terminada = true;

// Buscamos los elementos de la página
const elCrupier = document.getElementById("cartas-crupier");
const elJugador = document.getElementById("cartas-jugador");
const elValorCrupier = document.getElementById("valor-crupier");
const elValorJugador = document.getElementById("valor-jugador");
const elApuesta = document.getElementById("apuesta");
const elMensaje = document.getElementById("mensaje");
const btnHit = document.getElementById("btn-hit");
const btnStay = document.getElementById("btn-stay");
const btnDouble = document.getElementById("btn-double");
const btnNueva = document.getElementById("btn-nueva");

btnHit.addEventListener("click", pedirCarta);
btnStay.addEventListener("click", plantarse);
btnDouble.addEventListener("click", doblar);
btnNueva.addEventListener("click", nuevaMano);

// ---------- Calcular cuánto valen las cartas ----------
// J, Q y K valen 10. El As vale 11, pero si nos pasamos de 21 pasa a valer 1.
function valorMano(cartas) {
  let total = 0;
  let ases = 0;

  cartas.forEach(function (carta) {
    if (carta.nombre === "A") {
      total = total + 11;
      ases = ases + 1;
    } else if (carta.nombre === "J" || carta.nombre === "Q" || carta.nombre === "K") {
      total = total + 10;
    } else {
      total = total + carta.valor;
    }
  });

  while (total > 21 && ases > 0) {
    total = total - 10;
    ases = ases - 1;
  }
  return total;
}

// ---------- Empezar una mano ----------
function nuevaMano() {
  if (obtenerSaldo() < APUESTA) {
    elMensaje.textContent = "No tienes saldo suficiente. Puedes reiniciarlo en Opciones.";
    return;
  }

  cambiarSaldo(obtenerSaldo() - APUESTA);
  apuestaActual = APUESTA;
  mazo = barajar(crearMazo());
  cartasJugador = [mazo.pop(), mazo.pop()];
  cartasCrupier = [mazo.pop(), mazo.pop()];
  terminada = false;
  sonido(500, 0.1);

  // si alguien tiene 21 con dos cartas (blackjack), la mano termina enseguida
  if (valorMano(cartasJugador) === 21 || valorMano(cartasCrupier) === 21) {
    terminarMano();
  } else {
    elMensaje.textContent = "Tu turno: Hit, Stay o Double.";
    dibujar();
    activarBotones(true);
  }
}

function activarBotones(jugando) {
  btnHit.disabled = !jugando;
  btnStay.disabled = !jugando;
  btnDouble.disabled = !jugando;
  btnNueva.disabled = jugando;
}

// ---------- Dibujar las cartas en pantalla ----------
function dibujar() {
  elCrupier.innerHTML = "";
  cartasCrupier.forEach(function (carta, i) {
    // la segunda carta del crupier está tapada hasta que termina la mano
    const tapada = (i === 1 && !terminada);
    elCrupier.appendChild(dibujarCarta(carta, tapada));
  });

  elJugador.innerHTML = "";
  cartasJugador.forEach(function (carta) {
    elJugador.appendChild(dibujarCarta(carta, false));
  });

  elValorJugador.textContent = valorMano(cartasJugador);

  if (terminada) {
    elValorCrupier.textContent = valorMano(cartasCrupier);
  } else {
    elValorCrupier.textContent = valorMano([cartasCrupier[0]]) + " + ?";
  }

  elApuesta.textContent = "Apuesta: " + formatear(apuestaActual);
}

// ---------- Botones del jugador ----------
function pedirCarta() {
  if (terminada) {
    return;
  }
  cartasJugador.push(mazo.pop());
  sonido(500, 0.08);

  const valor = valorMano(cartasJugador);
  if (valor > 21) {
    terminarMano();            // se pasó
  } else if (valor === 21) {
    plantarse();               // con 21 no tiene sentido pedir más
  } else {
    dibujar();
  }
}

function plantarse() {
  if (terminada) {
    return;
  }
  // el crupier pide cartas hasta llegar a 17 o más
  while (valorMano(cartasCrupier) < 17) {
    cartasCrupier.push(mazo.pop());
  }
  terminarMano();
}

function doblar() {
  if (terminada) {
    return;
  }
  if (cartasJugador.length !== 2) {
    elMensaje.textContent = "Solo puedes doblar con tus dos primeras cartas.";
    return;
  }
  if (obtenerSaldo() < apuestaActual) {
    elMensaje.textContent = "No tienes saldo suficiente para doblar.";
    return;
  }

  // se paga otra apuesta igual, se recibe una sola carta y se planta
  cambiarSaldo(obtenerSaldo() - apuestaActual);
  apuestaActual = apuestaActual * 2;
  cartasJugador.push(mazo.pop());
  sonido(600, 0.1);

  if (valorMano(cartasJugador) > 21) {
    terminarMano();
  } else {
    plantarse();
  }
}

// ---------- Ver quién ganó ----------
function terminarMano() {
  terminada = true;

  const jugador = valorMano(cartasJugador);
  const crupier = valorMano(cartasCrupier);
  const jugadorBlackjack = (jugador === 21 && cartasJugador.length === 2);
  const crupierBlackjack = (crupier === 21 && cartasCrupier.length === 2);

  let texto = "";

  if (jugador > 21) {
    texto = "Te pasaste de 21. Perdiste " + formatear(apuestaActual) + ".";
    sonidoPerder();
  } else if (jugadorBlackjack && crupierBlackjack) {
    cambiarSaldo(obtenerSaldo() + apuestaActual);
    texto = "Los dos tienen blackjack: empate.";
    sonido(500, 0.2);
  } else if (jugadorBlackjack) {
    // el blackjack paga 3 a 2
    cambiarSaldo(obtenerSaldo() + apuestaActual * 2.5);
    texto = "¡Blackjack! Ganaste " + formatear(apuestaActual * 1.5) + ".";
    sonidoGanar();
  } else if (crupierBlackjack) {
    texto = "El crupier tiene blackjack. Perdiste " + formatear(apuestaActual) + ".";
    sonidoPerder();
  } else if (crupier > 21) {
    cambiarSaldo(obtenerSaldo() + apuestaActual * 2);
    texto = "El crupier se pasó. ¡Ganaste " + formatear(apuestaActual) + "!";
    sonidoGanar();
  } else if (jugador > crupier) {
    cambiarSaldo(obtenerSaldo() + apuestaActual * 2);
    texto = "¡Ganaste " + formatear(apuestaActual) + "!";
    sonidoGanar();
  } else if (jugador < crupier) {
    texto = "El crupier gana. Perdiste " + formatear(apuestaActual) + ".";
    sonidoPerder();
  } else {
    cambiarSaldo(obtenerSaldo() + apuestaActual);
    texto = "Empate: recuperas tu apuesta.";
    sonido(500, 0.2);
  }

  elMensaje.textContent = texto;
  dibujar();
  activarBotones(false);
}

// ---------- Al abrir la página: esperando "Nueva mano" ----------
activarBotones(false);
elMensaje.textContent = "Pulsa «Nueva mano» para empezar (apuesta: " + formatear(APUESTA) + ").";
