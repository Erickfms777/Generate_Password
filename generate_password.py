"""Generador de contraseñas seguras.

Usa el módulo `secrets` (pensado para seguridad) en lugar de `random`,
que NO es seguro para generar contraseñas.
"""

import secrets
import string

MINUSCULAS = string.ascii_lowercase
MAYUSCULAS = string.ascii_uppercase
NUMEROS = string.digits
SIMBOLOS = "!@#$%^&*()-_=+[]{};:,.<>?"


def generar_contrasena(longitud=16, usar_mayusculas=True, usar_numeros=True, usar_simbolos=True):
    """Genera una contraseña aleatoria con las opciones indicadas."""
    if longitud < 8:
        raise ValueError("La longitud mínima recomendada es 8 caracteres.")

    # Siempre hay minúsculas; el resto depende de lo que elija el usuario
    grupos = [MINUSCULAS]
    if usar_mayusculas:
        grupos.append(MAYUSCULAS)
    if usar_numeros:
        grupos.append(NUMEROS)
    if usar_simbolos:
        grupos.append(SIMBOLOS)

    if longitud < len(grupos):
        raise ValueError("La longitud es muy corta para los tipos de caracteres elegidos.")

    # Garantiza al menos un carácter de cada grupo elegido
    caracteres = [secrets.choice(grupo) for grupo in grupos]

    # Rellena el resto con caracteres de cualquier grupo
    todos = "".join(grupos)
    caracteres += [secrets.choice(todos) for _ in range(longitud - len(caracteres))]

    # Mezcla con un generador seguro para que los obligatorios no queden al inicio
    secrets.SystemRandom().shuffle(caracteres)
    return "".join(caracteres)


def preguntar_si_no(texto):
    """Pregunta sí/no y devuelve True o False (valida la entrada)."""
    while True:
        respuesta = input(f"{texto} (s/n): ").strip().lower()
        if respuesta in ("s", "si", "sí"):
            return True
        if respuesta in ("n", "no"):
            return False
        print("Responde con 's' o 'n'.")


def preguntar_longitud():
    """Pide la longitud y valida que sea un número válido."""
    while True:
        entrada = input("Longitud de la contraseña (8-64) [16]: ").strip()
        if entrada == "":
            return 16
        if entrada.isdigit() and 8 <= int(entrada) <= 64:
            return int(entrada)
        print("Escribe un número entre 8 y 64.")


def main():
    print("=== Generador de contraseñas seguras ===\n")
    longitud = preguntar_longitud()
    mayusculas = preguntar_si_no("¿Incluir mayúsculas?")
    numeros = preguntar_si_no("¿Incluir números?")
    simbolos = preguntar_si_no("¿Incluir símbolos?")

    while True:
        print("\nTu contraseña:", generar_contrasena(longitud, mayusculas, numeros, simbolos))
        if not preguntar_si_no("¿Generar otra?"):
            break
    print("¡Listo! Guárdala en un gestor de contraseñas.")


if __name__ == "__main__":
    main()
