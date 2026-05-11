# Siguientes Pasos (Next Steps)

Para completar con éxito la fase del Generador de Analizadores Sintácticos en las próximas semanas, estas son las tareas secuenciales a abordar:

## 1. Construcción del Lector YAPar (`GrammarReader.js`)
- Escribir la expresión regular o pequeño parser que leerá los archivos `.yalp` bajo la especificación YAPar.
- Eliminar comentarios `/* */` y procesar los `%token` e `IGNORE`.
- Dividir el archivo en el separador `%%`.
- Parsear las producciones (ej. `production1: TOKEN_2 | production3 ;`), guardándolas en memoria.

## 2. Desarrollo del Motor Core (`LR0Automaton.js`)
- Implementar la función `closure(I)` que reciba un conjunto de items y calcule la cerradura transitiva de las reglas.
- Implementar la función `goto(I, X)` que devuelva la transición sobre el símbolo `X` a partir del estado `I`.
- Crear el ciclo principal que construya el conjunto completo de estados LR(0).

## 3. Generación de Tablas (`ParserGenerator.js`)
- Mapear cada transición del autómata a la matriz de GOTO y a la matriz ACTION.
- Implementar las condiciones lógicas para detectar colisiones en una celda (Conflictos Shift/Reduce y Reduce/Reduce).

## 4. Code Emitter (`parser.py`)
- Crear una plantilla estática en Python que implemente el "Driver" (Algoritmo general de parsing LR).
- Inyectar dinámicamente desde Node.js la tabla ACTION, GOTO y las producciones numéricas dentro de `parser.py`.
- Integrar `from lexer import getToken` en la cabecera de la plantilla generada.
