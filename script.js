const MINUSCULAS = "abcdefghijklmnopqrstuvwxyz";
const MAYUSCULAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMEROS = "0123456789";
const SIMBOLOS = "!@#$%^&*()-_=+[]{};:,.<>?";

// Entero aleatorio en [0, max) sin sesgo de módulo (rechazo de valores sobrantes)
function enteroAleatorio(max) {
  const limite = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limite);
  return buffer[0] % max;
}

function elegir(texto) {
  return texto[enteroAleatorio(texto.length)];
}

function generar(longitud, usarMayusculas, usarNumeros, usarSimbolos) {
  const grupos = [MINUSCULAS];
  if (usarMayusculas) grupos.push(MAYUSCULAS);
  if (usarNumeros) grupos.push(NUMEROS);
  if (usarSimbolos) grupos.push(SIMBOLOS);

  // Al menos un carácter de cada grupo elegido
  const caracteres = grupos.map(elegir);
  const todos = grupos.join("");
  while (caracteres.length < longitud) caracteres.push(elegir(todos));

  // Mezcla Fisher-Yates con aleatoriedad segura
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = enteroAleatorio(i + 1);
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }
  return { texto: caracteres.join(""), tamanoAlfabeto: todos.length };
}

function evaluar(longitud, tamanoAlfabeto) {
  const bits = longitud * Math.log2(tamanoAlfabeto);
  if (bits < 50) return { nombre: "Débil", color: "var(--debil)", ancho: 30, bits };
  if (bits < 80) return { nombre: "Media", color: "var(--media)", ancho: 65, bits };
  return { nombre: "Fuerte", color: "var(--fuerte)", ancho: 100, bits };
}

const $ = (id) => document.getElementById(id);

function actualizar() {
  const longitud = Number($("longitud").value);
  $("valorLongitud").textContent = longitud;

  const { texto, tamanoAlfabeto } = generar(
    longitud,
    $("mayusculas").checked,
    $("numeros").checked,
    $("simbolos").checked
  );
  $("resultado").textContent = texto;

  const nivel = evaluar(longitud, tamanoAlfabeto);
  $("nivel").style.width = nivel.ancho + "%";
  $("nivel").style.background = nivel.color;
  $("etiqueta").textContent = `${nivel.nombre} · ${Math.round(nivel.bits)} bits de entropía`;
  $("copiar").textContent = "Copiar";
}

async function copiar() {
  const texto = $("resultado").textContent;
  try {
    await navigator.clipboard.writeText(texto);
    $("copiar").textContent = "¡Copiada!";
  } catch {
    $("copiar").textContent = "Selecciona y copia";
  }
}

$("generar").addEventListener("click", actualizar);
$("copiar").addEventListener("click", copiar);
["longitud", "mayusculas", "numeros", "simbolos"].forEach((id) =>
  $(id).addEventListener("input", actualizar)
);
actualizar();
