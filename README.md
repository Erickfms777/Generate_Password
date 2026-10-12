# Generador de contraseñas seguras

Generador de contraseñas aleatorias en el navegador. Permite elegir la longitud (8 a 64) y si incluir mayúsculas, números y símbolos, y muestra la fortaleza según la entropía en bits.

**Demo:** https://erickfms777.github.io/Generate_Password/

## Archivos

| Archivo | Lenguaje | Función |
| --- | --- | --- |
| `index.html` | HTML | Estructura de la página |
| `style.css` | CSS | Colores y diseño |
| `script.js` | JavaScript | Genera la contraseña y calcula la fortaleza |
| `generate_password.py` | Python | Versión de consola |

## Seguridad

- Usa `crypto.getRandomValues` (equivalente a `secrets` en Python), no `Math.random`.
- Todo se genera en el navegador: no se guarda ni se envía nada.

## Uso

Abre `index.html` en el navegador, o visita la demo.
