// ============================================
// opciones.js
// Funcionamiento de la página de opciones.
// ============================================

const sliderVolumen = document.getElementById("volumen");
const textoVolumen = document.getElementById("texto-volumen");
const checkMusica = document.getElementById("musica");
const checkEfectos = document.getElementById("efectos");
const checkSilencio = document.getElementById("silencio");
const botonReiniciar = document.getElementById("btn-reiniciar");
const mensaje = document.getElementById("mensaje");

// Al abrir la página, mostramos lo que el jugador había guardado antes
sliderVolumen.value = opciones.volumen;
textoVolumen.textContent = opciones.volumen + "%";
checkMusica.checked = opciones.musica;
checkEfectos.checked = opciones.efectos;
checkSilencio.checked = opciones.silencio;

// Guarda todo lo que está en pantalla
function guardarCambios() {
  opciones.volumen = Number(sliderVolumen.value);
  opciones.musica = checkMusica.checked;
  opciones.efectos = checkEfectos.checked;
  opciones.silencio = checkSilencio.checked;

  guardarDato("opciones", opciones);
  textoVolumen.textContent = opciones.volumen + "%";
  actualizarMusica();
}

// mientras se mueve el volumen, se va guardando
sliderVolumen.addEventListener("input", guardarCambios);

// cuando suelta el volumen, suena un pitido de prueba
sliderVolumen.addEventListener("change", function () {
  sonido(600, 0.15);
});

checkMusica.addEventListener("change", guardarCambios);
checkEfectos.addEventListener("change", function () {
  guardarCambios();
  sonido(600, 0.1);
});
checkSilencio.addEventListener("change", guardarCambios);

// ---------- Reiniciar saldo ----------
botonReiniciar.addEventListener("click", function () {
  cambiarSaldo(SALDO_INICIAL);
  mensaje.textContent = "Saldo reiniciado a " + formatear(SALDO_INICIAL) + ".";
  sonido(500, 0.1);
});
