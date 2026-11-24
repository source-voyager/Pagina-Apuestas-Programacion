// ============================================
// ruleta.js
// Funcionamiento de la ruleta.
// ============================================

const APUESTA = 500;

// Los mismos números que están en el HTML, en el mismo orden.
// Las posiciones pares (0, 2, 4...) son rojas y las impares son negras.
const numeros = [32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13];

let eleccion = null;       // "rojo", "negro" o "cero"
let girando = false;       // para que no se pueda girar dos veces a la vez
let rotacionActual = 0;    // cuántos grados lleva girada la rueda

// Buscamos los elementos de la página
const rueda = document.getElementById("rueda");
const botonGirar = document.getElementById("btn-girar");
const mensaje = document.getElementById("mensaje");
const botonesFicha = document.querySelectorAll(".ficha-boton");

// ---------- Elegir en qué apostar ----------
botonesFicha.forEach(function (boton) {
  boton.addEventListener("click", function () {
    if (girando) {
      return; // no se puede cambiar la apuesta mientras gira
    }
    // le quitamos "elegida" a todos y se la ponemos solo al que tocamos
    botonesFicha.forEach(function (b) {
      b.classList.remove("elegida");
    });
    boton.classList.add("elegida");

    eleccion = boton.dataset.eleccion;
    mensaje.textContent = "Apuestas a: " + eleccion.toUpperCase() + ". ¡Ahora gira!";
    sonido(600, 0.05);
  });
});

// ---------- Girar ----------
botonGirar.addEventListener("click", girar);

function girar() {
  if (girando) {
    return;
  }
  if (eleccion === null) {
    mensaje.textContent = "Primero elige Rojo, Negro o Cero.";
    return;
  }
  if (obtenerSaldo() < APUESTA) {
    mensaje.textContent = "No tienes saldo suficiente. Puedes reiniciarlo en Opciones.";
    return;
  }

  // cobramos la apuesta
  cambiarSaldo(obtenerSaldo() - APUESTA);
  girando = true;
  botonGirar.disabled = true;
  mensaje.textContent = "Girando...";

  // Hay 13 resultados posibles: los 12 números de la rueda y el cero.
  // Sacamos un número del 0 al 12; el 12 significa "cero".
  const sorteo = Math.floor(Math.random() * 13);

  // ángulo donde está el resultado dentro de la rueda
  let angulo = 0;
  if (sorteo < 12) {
    angulo = 15 + sorteo * 30;
  }

  // Calculamos cuánto girar para que ese resultado quede arriba, donde está el puntero.
  // Siempre damos 5 vueltas completas para que se vea el giro.
  const posicionActual = rotacionActual % 360;
  const destino = (360 - angulo) % 360;
  const falta = (destino - posicionActual + 360) % 360;
  rotacionActual = rotacionActual + 360 * 5 + falta;
  rueda.style.transform = "rotate(" + rotacionActual + "deg)";

  // un "tic" mientras gira
  const tic = setInterval(function () {
    sonido(800, 0.03);
  }, 150);

  // la rueda tarda 4 segundos en frenar (está en el CSS)
  setTimeout(function () {
    clearInterval(tic);
    terminarGiro(sorteo);
  }, 4100);
}

// ---------- Ver si ganó ----------
function terminarGiro(sorteo) {
  let numero = 0;
  let color = "cero";

  if (sorteo < 12) {
    numero = numeros[sorteo];
    if (sorteo % 2 === 0) {
      color = "rojo";
    } else {
      color = "negro";
    }
  }

  if (eleccion === color) {
    // el cero paga 10 a 1, los colores pagan 1 a 1
    let ganancia = APUESTA;
    if (color === "cero") {
      ganancia = APUESTA * 10;
    }
    cambiarSaldo(obtenerSaldo() + APUESTA + ganancia);
    mensaje.textContent = "Salió el " + numero + " (" + color + "). ¡Ganaste " + formatear(ganancia) + "!";
    sonidoGanar();
  } else {
    mensaje.textContent = "Salió el " + numero + " (" + color + "). Perdiste " + formatear(APUESTA) + ".";
    sonidoPerder();
  }

  girando = false;
  botonGirar.disabled = false;
}
