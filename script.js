const $ = (id) => document.getElementById(id);

/* ============================================================
   1. GENERADOR DE CONTRASEÑAS
   ============================================================ */
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

// Copia un texto al portapapeles y cambia el rótulo del botón
async function copiarTexto(boton, texto) {
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    boton.textContent = "¡Copiado!";
  } catch {
    boton.textContent = "Selecciona y copia";
  }
}

$("generar").addEventListener("click", actualizar);
$("copiar").addEventListener("click", () => copiarTexto($("copiar"), $("resultado").textContent));
["longitud", "mayusculas", "numeros", "simbolos"].forEach((id) =>
  $(id).addEventListener("input", actualizar)
);

/* ============================================================
   2. CIFRAR Y DESCIFRAR (Web Crypto: PBKDF2 + AES-GCM)
   ============================================================ */
const ITERACIONES = 600000; // hace lento cada intento de adivinar la clave maestra
const TAM_SAL = 16;         // bytes de sal aleatoria
const TAM_IV = 12;          // bytes del vector de inicialización de AES-GCM
const TAM_ETIQUETA = 16;    // bytes de la etiqueta de autenticación de AES-GCM

const codificador = new TextEncoder();
const decodificador = new TextDecoder();

// Convierte la clave maestra en una llave AES de 256 bits
async function derivarLlave(claveMaestra, sal) {
  const material = await crypto.subtle.importKey(
    "raw", codificador.encode(claveMaestra), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: sal, iterations: ITERACIONES, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function aBase64(bytes) {
  let texto = "";
  bytes.forEach((b) => { texto += String.fromCharCode(b); });
  return btoa(texto);
}

function deBase64(texto) {
  const binario = atob(texto.replace(/\s+/g, ""));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

// Devuelve sal + iv + texto cifrado, todo junto en base64
async function cifrar(texto, claveMaestra) {
  const sal = crypto.getRandomValues(new Uint8Array(TAM_SAL));
  const iv = crypto.getRandomValues(new Uint8Array(TAM_IV));
  const llave = await derivarLlave(claveMaestra, sal);
  const cifrado = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, llave, codificador.encode(texto))
  );
  const todo = new Uint8Array(TAM_SAL + TAM_IV + cifrado.length);
  todo.set(sal, 0);
  todo.set(iv, TAM_SAL);
  todo.set(cifrado, TAM_SAL + TAM_IV);
  return aBase64(todo);
}

async function descifrar(textoCifrado, claveMaestra) {
  try {
    const datos = deBase64(textoCifrado);
    if (datos.length < TAM_SAL + TAM_IV + TAM_ETIQUETA) throw new Error("corto");
    const sal = datos.slice(0, TAM_SAL);
    const iv = datos.slice(TAM_SAL, TAM_SAL + TAM_IV);
    const cifrado = datos.slice(TAM_SAL + TAM_IV);
    const llave = await derivarLlave(claveMaestra, sal);
    const plano = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, llave, cifrado);
    return decodificador.decode(plano);
  } catch {
    // Mensaje genérico: no revela si falló la clave o el texto
    throw new Error("Clave maestra incorrecta o texto cifrado dañado.");
  }
}

function mostrarEstado(id, mensaje, tipo) {
  const elemento = $(id);
  elemento.textContent = mensaje;
  elemento.className = "estado" + (tipo ? " " + tipo : "");
}

// Mientras se calcula, desactiva el botón para evitar clics repetidos
async function conBoton(boton, tarea) {
  const rotulo = boton.textContent;
  boton.disabled = true;
  boton.textContent = "Procesando…";
  try {
    await tarea();
  } finally {
    boton.disabled = false;
    boton.textContent = rotulo;
  }
}

async function alCifrar() {
  const texto = $("textoCifrar").value;
  const clave = $("claveCifrar").value;
  $("resultadoCifrado").textContent = "";
  $("copiarCifrado").textContent = "Copiar";
  if (!texto || !clave) {
    mostrarEstado("estadoCifrar", "Escribe la contraseña y la clave maestra.", "error");
    return;
  }
  await conBoton($("botonCifrar"), async () => {
    $("resultadoCifrado").textContent = await cifrar(texto, clave);
    mostrarEstado("estadoCifrar", "Listo. Guarda el texto cifrado y recuerda tu clave maestra.", "ok");
  });
}

async function alDescifrar() {
  const texto = $("textoDescifrar").value.trim();
  const clave = $("claveDescifrar").value;
  $("resultadoDescifrado").textContent = "";
  $("copiarDescifrado").textContent = "Copiar";
  if (!texto || !clave) {
    mostrarEstado("estadoDescifrar", "Pega el texto cifrado y escribe la clave maestra.", "error");
    return;
  }
  await conBoton($("botonDescifrar"), async () => {
    try {
      $("resultadoDescifrado").textContent = await descifrar(texto, clave);
      mostrarEstado("estadoDescifrar", "Descifrado correctamente.", "ok");
    } catch (error) {
      mostrarEstado("estadoDescifrar", error.message, "error");
    }
  });
}

// Casilla "Mostrar lo que escribo": alterna entre password y text
function enlazarMostrar(casilla, campos) {
  $(casilla).addEventListener("change", () => {
    const tipo = $(casilla).checked ? "text" : "password";
    campos.forEach((id) => { $(id).type = tipo; });
  });
}

$("botonCifrar").addEventListener("click", alCifrar);
$("botonDescifrar").addEventListener("click", alDescifrar);
$("copiarCifrado").addEventListener("click", () =>
  copiarTexto($("copiarCifrado"), $("resultadoCifrado").textContent)
);
$("copiarDescifrado").addEventListener("click", () =>
  copiarTexto($("copiarDescifrado"), $("resultadoDescifrado").textContent)
);
$("usarGenerada").addEventListener("click", () => {
  $("textoCifrar").value = $("resultado").textContent;
});
enlazarMostrar("mostrarCifrar", ["textoCifrar", "claveCifrar"]);
// En descifrar, el texto cifrado es un <textarea>; solo se alterna la clave
enlazarMostrar("mostrarDescifrar", ["claveDescifrar"]);

/* ============================================================
   3. PESTAÑAS
   ============================================================ */
const PESTANAS = ["generar", "cifrar", "descifrar"];

function mostrarPestana(nombre) {
  PESTANAS.forEach((p) => {
    const activa = p === nombre;
    $("tab-" + p).setAttribute("aria-selected", activa);
    $("tab-" + p).tabIndex = activa ? 0 : -1;
    $("panel-" + p).hidden = !activa;
  });
}

PESTANAS.forEach((p, i) => {
  $("tab-" + p).addEventListener("click", () => mostrarPestana(p));
  // Flechas izquierda/derecha para moverse entre pestañas
  $("tab-" + p).addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const salto = e.key === "ArrowRight" ? 1 : -1;
    const siguiente = PESTANAS[(i + salto + PESTANAS.length) % PESTANAS.length];
    mostrarPestana(siguiente);
    $("tab-" + siguiente).focus();
  });
});

actualizar();
