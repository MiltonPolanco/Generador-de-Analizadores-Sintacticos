# Checkpoint Semana 17: Generador de Analizadores Sintácticos

## Objetivo del Checkpoint
Este documento presenta el estado de avance del proyecto de Generación de Analizadores Sintácticos, evidenciando que existe una arquitectura planificada, un proceso ágil en curso (Kanban) y un cimiento técnico validado en la fase anterior.

## Estado Actual: Qué se hizo (Fase Léxica Completada)
A la fecha, se cuenta con una fase léxica completamente funcional, construida en Node.js, que lee un archivo de gramática léxica (`.yal`) y genera de forma automática un tokenizador funcional (`lexer.py`).

Los módulos estabilizados son:
- **`YALexParser.js`**: Lee y valida las definiciones del lenguaje (`let`, `rule`, etc.).
- **`RegexToAST.js`**: Convierte las expresiones regulares en un Árbol de Sintaxis Abstracta (AST) manejable, inyectando nodos `#` y calculando anulabilidad, `firstpos`, `lastpos` y `followpos`.
- **`DirectDFA.js`**: A partir del AST, construye directamente un Autómata Finito Determinista (DFA) óptimo.
- **`Generator.js`**: Toma el DFA y genera el código en Python (`lexer.py`), que posteriormente servirá como el módulo de `getToken()` para el parser.

## En Curso: Qué se está diseñando (Arquitectura Sintáctica)
Actualmente el proyecto se encuentra en la fase de **Arquitectura y Diseño** del Generador de Analizadores Sintácticos. El analizador sintáctico no está finalizado, pero su esqueleto y módulos ya están definidos para soportar análisis Ascendente (Bottom-Up).

El diseño incluye la integración natural del output de la fase léxica. `lexer.py` será importado directamente por el código Python que genere la fase sintáctica (`parser.py`). El parser le pedirá tokens bajo demanda (`getToken()`) para alimentar el algoritmo de parsing Shift-Reduce.

## Referencias
- [Arquitectura del Parser](./parser_architecture.md)
- [Kanban y Planificación](./kanban_semana17.md)
- [Siguientes Pasos](./next_steps.md)
