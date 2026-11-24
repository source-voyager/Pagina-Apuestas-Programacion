// ============================================
// slot.js
// Funcionamiento de la tragamonedas.
// ============================================

const APUESTA = 250;
const simbolos = ["🍒", "🍋", "🔔", "⭐", "💎", "7"];

const rodillos = document.querySelectorAll(".rodillo");
const botonTirar = document.getElementById("btn-tirar");
const palanca = document.querySelector(".palanca");
const mensaje = document.getElementById("mensaje");

let girando = false;

// se puede jugar con el botón o tocando la palanca
botonTirar.addEventListener("click", tirar);
palanca.addEventListener("click", tirar);

// devuelve un símbolo cualquiera de la lista
function simboloAlAzar() {
  const posicion = Math.floor(Math.random() * simbolos.length);
  return simbolos[posicion];
}

function tirar() {
  if (girando) {
    return;
  }
  if (obtenerSaldo() < APUESTA) {
    mensaje.textContent = "No tienes saldo suficiente. Puedes reiniciarlo en Opciones.";
    return;
  }

  cambiarSaldo(obtenerSaldo() - APUESTA);
  girando = true;
  botonTirar.disabled = true;
  mensaje.textContent = "Girando...";

  // bajamos la palanca un ratito
  palanca.classList.add("abajo");
  setTimeout(function () {
    palanca.classList.remove("abajo");
  }, 400);

  const resultado = [];

  // Cada rodillo cambia de símbolo muy rápido y se detiene en un momento distinto
  rodillos.forEach(function (rodillo, i) {
    const cambio = setInterval(function () {
      rodillo.textContent = simboloAlAzar();
    }, 80);

    setTimeout(function () {
      clearInterval(cambio);
      resultado[i] = simboloAlAzar();
      rodillo.textContent = resultado[i];
      sonido(400 + i * 100, 0.1);

      // cuando se frena el último rodillo, vemos si hay premio
      if (i === rodillos.length - 1) {
        revisarPremio(resultado);
      }
    }, 1000 + i * 600);
  });
}

function revisarPremio(resultado) {
  const a = resultado[0];
  const b = resultado[1];
  const c = resultado[2];

  let multiplicador = 0;

  if (a === b && b === c) {
    // tres iguales
    if (a === "7") {
      multiplicador = 25;
    } else if (a === "💎") {
      multiplicador = 15;
    } else {
      multiplicador = 8;
    }
    mensaje.textContent = "¡Tres iguales! Ganaste " + formatear(APUESTA * multiplicador) + ".";
    sonidoGanar();
  } else if (a === b || b === c || a === c) {
    // dos iguales: solo recuperas lo que apostaste
    multiplicador = 1;
    mensaje.textContent = "Dos iguales: recuperas tu apuesta.";
    sonido(500, 0.15);
  } else {
    mensaje.textContent = "Nada esta vez. Perdiste " + formatear(APUESTA) + ".";
    sonidoPerder();
  }

  cambiarSaldo(obtenerSaldo() + APUESTA * multiplicador);
  girando = false;
  botonTirar.disabled = false;
}
