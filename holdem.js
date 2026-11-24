// ============================================
// holdem.js
// Texas Hold'em: tú contra un rival de la computadora.
//
// La mano tiene 4 etapas:
//   0 = antes del flop (no se ve ninguna carta de la mesa)
//   1 = flop  (3 cartas)
//   2 = turn  (4 cartas)
//   3 = river (5 cartas)
//   4 = showdown (se comparan las manos)
// ============================================

const ANTE = 100;      // lo que pone cada uno para empezar la mano
const APUESTA = 200;   // lo que cuesta el botón Bet

let mazo = [];
let misCartas = [];
let cartasRival = [];
let cartasMesa = [];
let bote = 0;
let etapa = 0;
let manoTerminada = true;

// Buscamos los elementos de la página
const elMesa = document.getElementById("cartas-mesa");
const elMias = document.getElementById("mis-cartas");
const elRival = document.getElementById("cartas-rival");
const elBote = document.getElementById("bote");
const elNombreMano = document.getElementById("nombre-mano");
const elMensaje = document.getElementById("mensaje");
const btnCheck = document.getElementById("btn-check");
const btnBet = document.getElementById("btn-bet");
const btnFold = document.getElementById("btn-fold");
const btnNueva = document.getElementById("btn-nueva");

btnCheck.addEventListener("click", hacerCheck);
btnBet.addEventListener("click", hacerBet);
btnFold.addEventListener("click", hacerFold);
btnNueva.addEventListener("click", nuevaMano);

// ---------- Empezar una mano ----------
function nuevaMano() {
  if (obtenerSaldo() < ANTE) {
    elMensaje.textContent = "No tienes saldo suficiente. Puedes reiniciarlo en Opciones.";
    return;
  }

  cambiarSaldo(obtenerSaldo() - ANTE);
  mazo = barajar(crearMazo());
  misCartas = [mazo.pop(), mazo.pop()];
  cartasRival = [mazo.pop(), mazo.pop()];
  cartasMesa = [mazo.pop(), mazo.pop(), mazo.pop(), mazo.pop(), mazo.pop()];
  bote = ANTE * 2;   // pusimos los dos
  etapa = 0;
  manoTerminada = false;

  elMensaje.textContent = "Nueva mano. Elige: Check, Bet o Fold.";
  sonido(500, 0.1);
  dibujarTodo(false);
  activarBotones(true);
}

// activa los botones de jugar (o el de nueva mano)
function activarBotones(jugando) {
  btnCheck.disabled = !jugando;
  btnBet.disabled = !jugando;
  btnFold.disabled = !jugando;
  btnNueva.disabled = jugando;
}

// ---------- Dibujar las cartas en pantalla ----------
function dibujarTodo(mostrarRival) {
  // cuántas cartas de la mesa se ven según la etapa
  const visibles = [0, 3, 4, 5, 5][etapa];

  elMesa.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    elMesa.appendChild(dibujarCarta(cartasMesa[i], i >= visibles));
  }

  elMias.innerHTML = "";
  misCartas.forEach(function (carta) {
    elMias.appendChild(dibujarCarta(carta, false));
  });

  elRival.innerHTML = "";
  cartasRival.forEach(function (carta) {
    elRival.appendChild(dibujarCarta(carta, !mostrarRival));
  });

  elBote.textContent = "Bote: " + formatear(bote);

  // el nombre de tu mejor mano con las cartas que se ven
  const cartasVisibles = misCartas.concat(cartasMesa.slice(0, visibles));
  elNombreMano.textContent = evaluar(cartasVisibles).nombre;
}

// ---------- Botones del jugador ----------
function hacerCheck() {
  if (manoTerminada) {
    return;
  }
  sonido(450, 0.08);
  elMensaje.textContent = "Check.";
  siguienteEtapa();
}

function hacerBet() {
  if (manoTerminada) {
    return;
  }
  if (obtenerSaldo() < APUESTA) {
    elMensaje.textContent = "No tienes saldo para apostar " + formatear(APUESTA) + ".";
    return;
  }

  cambiarSaldo(obtenerSaldo() - APUESTA);
  bote = bote + APUESTA;
  sonido(700, 0.1);

  // El rival decide: 1 de cada 4 veces se retira
  if (Math.random() < 0.25) {
    ganarSinShowdown("El rival se retiró. ¡Ganaste el bote de " + formatear(bote) + "!");
    return;
  }

  bote = bote + APUESTA;   // el rival iguala
  elMensaje.textContent = "El rival igualó tu apuesta.";
  siguienteEtapa();
}

function hacerFold() {
  if (manoTerminada) {
    return;
  }
  manoTerminada = true;
  elMensaje.textContent = "Te retiraste. El rival se queda con el bote.";
  sonidoPerder();
  dibujarTodo(false);
  activarBotones(false);
}

// ---------- Avanzar la mano ----------
function siguienteEtapa() {
  etapa = etapa + 1;
  if (etapa === 4) {
    showdown();
  } else {
    dibujarTodo(false);
  }
}

function ganarSinShowdown(texto) {
  cambiarSaldo(obtenerSaldo() + bote);
  manoTerminada = true;
  elMensaje.textContent = texto;
  sonidoGanar();
  dibujarTodo(false);
  activarBotones(false);
}

// se comparan las manos de los dos jugadores
function showdown() {
  const miMano = evaluar(misCartas.concat(cartasMesa));
  const manoRival = evaluar(cartasRival.concat(cartasMesa));
  const resultado = compararPuntos(miMano.puntos, manoRival.puntos);
  const detalle = " (Tú: " + miMano.nombre + ", rival: " + manoRival.nombre + ")";

  if (resultado > 0) {
    cambiarSaldo(obtenerSaldo() + bote);
    elMensaje.textContent = "¡Ganaste " + formatear(bote) + "!" + detalle;
    sonidoGanar();
  } else if (resultado < 0) {
    elMensaje.textContent = "Perdiste esta mano." + detalle;
    sonidoPerder();
  } else {
    cambiarSaldo(obtenerSaldo() + bote / 2);
    elMensaje.textContent = "Empate, se reparte el bote." + detalle;
    sonido(500, 0.2);
  }

  manoTerminada = true;
  dibujarTodo(true);   // ahora sí mostramos las cartas del rival
  activarBotones(false);
}

// ============================================
// Evaluar manos de poker
// Cada mano se convierte en una lista de números ("puntos").
// El primer número es el tipo de mano (0 = carta alta ... 8 = escalera de color)
// y los demás son los valores de las cartas para desempatar.
// ============================================

// de una lista de cartas (hasta 7) devuelve la mejor mano de 5
function evaluar(cartas) {
  if (cartas.length <= 5) {
    return puntuar(cartas);
  }

  let mejor = null;
  const grupos = combinaciones(cartas, 5);
  for (let i = 0; i < grupos.length; i++) {
    const intento = puntuar(grupos[i]);
    if (mejor === null || compararPuntos(intento.puntos, mejor.puntos) > 0) {
      mejor = intento;
    }
  }
  return mejor;
}

// todas las formas de elegir "k" cartas de la lista
function combinaciones(lista, k) {
  const resultado = [];

  function elegir(inicio, actual) {
    if (actual.length === k) {
      resultado.push(actual.slice());
      return;
    }
    for (let i = inicio; i < lista.length; i++) {
      actual.push(lista[i]);
      elegir(i + 1, actual);
      actual.pop();
    }
  }

  elegir(0, []);
  return resultado;
}

// le pone puntos a un grupo de hasta 5 cartas
function puntuar(cartas) {
  // contamos cuántas veces aparece cada valor
  const conteo = {};
  cartas.forEach(function (carta) {
    conteo[carta.valor] = (conteo[carta.valor] || 0) + 1;
  });

  // lista de [cantidad, valor], las más repetidas primero y luego las más altas
  const grupos = Object.keys(conteo).map(function (valor) {
    return [conteo[valor], Number(valor)];
  });
  grupos.sort(function (a, b) {
    return (b[0] - a[0]) || (b[1] - a[1]);
  });

  let valores = grupos.map(function (g) { return g[1]; });

  // ¿todas del mismo palo?
  const hayColor = cartas.length === 5 && cartas.every(function (c) {
    return c.palo === cartas[0].palo;
  });

  // ¿cinco valores seguidos?
  let hayEscalera = false;
  if (cartas.length === 5 && grupos.length === 5) {
    if (valores[0] - valores[4] === 4) {
      hayEscalera = true;
    } else if (valores[0] === 14 && valores[1] === 5) {
      hayEscalera = true;          // A-2-3-4-5: el as cuenta como 1
      valores = [5, 4, 3, 2, 1];
    }
  }

  const mayor = grupos[0][0];                         // cuántas veces se repite la carta más repetida
  const segundo = grupos.length > 1 ? grupos[1][0] : 0;

  let tipo = 0;
  let nombre = "Carta alta";

  if (hayEscalera && hayColor) {
    tipo = 8; nombre = "Escalera de color";
  } else if (mayor === 4) {
    tipo = 7; nombre = "Póker";
  } else if (mayor === 3 && segundo === 2) {
    tipo = 6; nombre = "Full house";
  } else if (hayColor) {
    tipo = 5; nombre = "Color";
  } else if (hayEscalera) {
    tipo = 4; nombre = "Escalera";
  } else if (mayor === 3) {
    tipo = 3; nombre = "Trío";
  } else if (mayor === 2 && segundo === 2) {
    tipo = 2; nombre = "Doble par";
  } else if (mayor === 2) {
    tipo = 1; nombre = "Par";
  }

  return { puntos: [tipo].concat(valores), nombre: nombre };
}

// devuelve un número positivo si "a" es mejor, negativo si "b" es mejor, 0 si empatan
function compararPuntos(a, b) {
  const largo = Math.min(a.length, b.length);
  for (let i = 0; i < largo; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return 0;
}

// ---------- Al abrir la página: mesa vacía, esperando "Nueva mano" ----------
function mostrarInicio() {
  elMesa.innerHTML = "";
  elMias.innerHTML = "";
  elRival.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    elMesa.appendChild(dibujarCarta(null, true));
  }
  for (let i = 0; i < 2; i++) {
    elMias.appendChild(dibujarCarta(null, true));
    elRival.appendChild(dibujarCarta(null, true));
  }
  elMensaje.textContent = "Pulsa «Nueva mano» para empezar (cada jugador pone " + ANTE + ").";
  activarBotones(false);
}

mostrarInicio();
