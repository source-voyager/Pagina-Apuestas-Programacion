// ============================================
// shared.js
// Cosas que usan todas las páginas:
// el saldo, las opciones guardadas y los sonidos.
// ============================================

const SALDO_INICIAL = 25000;

// ---------- Guardar y leer datos del navegador ----------
// localStorage guarda cosas aunque cambiemos de página.
// Usamos try/catch por si el navegador no deja usarlo.
function leerDato(clave, valorPorDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    if (valor === null) {
      return valorPorDefecto;
    }
    return JSON.parse(valor);
  } catch (error) {
    return valorPorDefecto;
  }
}

function guardarDato(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    // si no se puede guardar, no pasa nada: el juego sigue funcionando
  }
}

// ---------- Saldo ----------
let saldoActual = leerDato("saldo", SALDO_INICIAL);

function obtenerSaldo() {
  return saldoActual;
}

function cambiarSaldo(nuevoSaldo) {
  saldoActual = nuevoSaldo;
  guardarDato("saldo", nuevoSaldo);
  mostrarSaldo();
}

// pone el saldo en la cabecera de la página
function mostrarSaldo() {
  const lugar = document.querySelector(".saldo .numero");
  if (lugar) {
    lugar.textContent = formatear(saldoActual);
  }
}

// convierte 24680 en "24,680"
function formatear(numero) {
  return Number(numero).toLocaleString("en-US");
}

// ---------- Opciones (se cambian en la página de Opciones) ----------
let opciones = leerDato("opciones", {
  volumen: 65,
  musica: false,
  efectos: true,
  silencio: false
});

// ---------- Sonidos ----------
// No usamos archivos de audio: el navegador "inventa" los pitidos.
let audio = null;

function tocarNota(frecuencia, duracion, fuerza) {
  try {
    if (audio === null) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    }
    // los navegadores bloquean el audio hasta que el usuario hace clic
    if (audio.state === "suspended") {
      audio.resume();
    }
    const oscilador = audio.createOscillator();
    const volumen = audio.createGain();
    oscilador.frequency.value = frecuencia;
    volumen.gain.value = (opciones.volumen / 100) * fuerza * 0.3;
    oscilador.connect(volumen);
    volumen.connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + duracion);
  } catch (error) {
    // si el navegador no tiene audio, simplemente no suena nada
  }
}

// sonido de efectos (clics, giros, etc.)
function sonido(frecuencia, duracion) {
  if (opciones.silencio || !opciones.efectos) {
    return;
  }
  tocarNota(frecuencia, duracion, 1);
}

function sonidoGanar() {
  sonido(523, 0.12);
  setTimeout(function () { sonido(659, 0.12); }, 130);
  setTimeout(function () { sonido(784, 0.3); }, 260);
}

function sonidoPerder() {
  sonido(300, 0.15);
  setTimeout(function () { sonido(220, 0.3); }, 160);
}

// ---------- Música de fondo ----------
const notasMusica = [262, 330, 392, 330, 294, 349, 440, 349];
let posicionNota = 0;
let relojMusica = null;

function actualizarMusica() {
  // primero paramos la música que hubiera
  if (relojMusica !== null) {
    clearInterval(relojMusica);
    relojMusica = null;
  }
  // y la prendemos solo si está activada y no estamos en modo silencioso
  if (opciones.musica && !opciones.silencio) {
    relojMusica = setInterval(function () {
      tocarNota(notasMusica[posicionNota], 0.4, 0.4);
      posicionNota = (posicionNota + 1) % notasMusica.length;
    }, 600);
  }
}

// ---------- Al abrir cualquier página ----------
mostrarSaldo();
actualizarMusica();
