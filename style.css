:root {
  --bg: #0d1117;
  --panel: #161b22;
  --borde: #30363d;
  --texto: #e6edf3;
  --suave: #8b949e;
  --acento: #2ea043;
  --debil: #f85149;
  --media: #d29922;
  --fuerte: #3fb950;
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--bg);
  color: var(--texto);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
main {
  width: 100%;
  max-width: 460px;
  background: var(--panel);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 24px;
}
h1 { font-size: 1.3rem; margin: 0 0 4px; }
p.sub { margin: 0 0 20px; color: var(--suave); font-size: .9rem; }

/* Pestañas */
.pestanas {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  background: var(--bg);
  border: 1px solid var(--borde);
  border-radius: 10px;
}
.pestana {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: 0;
  color: var(--suave);
  font-weight: 600;
}
.pestana:hover { background: #21262d; }
.pestana[aria-selected="true"] { background: #21262d; color: var(--texto); }

/* Resultado y botones */
.salida {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.salida.separado { margin-top: 16px; }
.resultado {
  flex: 1;
  min-width: 0;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--borde);
  border-radius: 8px;
  color: var(--texto);
  font: 1.05rem ui-monospace, "Cascadia Code", Menlo, monospace;
  overflow-wrap: anywhere;
  min-height: 3em;
  display: flex;
  align-items: center;
}
.resultado.pequeno { font-size: .8rem; }
button {
  border: 1px solid var(--borde);
  background: #21262d;
  color: var(--texto);
  border-radius: 8px;
  padding: 0 14px;
  font: inherit;
  cursor: pointer;
}
button:hover { background: #30363d; }
button:disabled { opacity: .6; cursor: wait; }
button.principal {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background: var(--acento);
  border-color: transparent;
  font-weight: 600;
}
button.principal:hover { background: #3fb950; }
button.secundario {
  margin-top: 8px;
  padding: 6px 10px;
  font-size: .8rem;
  color: var(--suave);
}

/* Generador */
.barra {
  height: 6px;
  background: var(--borde);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
#nivel { height: 100%; width: 0; transition: width .2s, background .2s; }
#etiqueta { font-size: .85rem; color: var(--suave); margin-bottom: 20px; }
.fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: .95rem;
}
input[type=range] { width: 100%; accent-color: var(--acento); margin-bottom: 16px; }
label.opcion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  cursor: pointer;
}
input[type=checkbox] { width: 18px; height: 18px; accent-color: var(--acento); }
.aviso { margin-top: 16px; font-size: .8rem; color: var(--suave); text-align: center; }

/* Cifrar y descifrar */
.ayuda { margin: 0 0 4px; font-size: .9rem; color: var(--suave); }
label.campo { display: block; margin: 16px 0 6px; font-size: .9rem; }
input[type=password], input[type=text], textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--borde);
  border-radius: 8px;
  color: var(--texto);
  font: .95rem ui-monospace, "Cascadia Code", Menlo, monospace;
}
textarea { resize: vertical; }
.estado { min-height: 1.4em; margin: 8px 0 0; font-size: .85rem; color: var(--suave); }
.estado.error { color: var(--debil); }
.estado.ok { color: var(--fuerte); }

:focus-visible { outline: 2px solid #58a6ff; outline-offset: 2px; }
