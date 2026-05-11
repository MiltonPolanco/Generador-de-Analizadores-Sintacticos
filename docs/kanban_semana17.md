# Kanban Board - Semana 17

Este documento refleja la gestión visual de las tareas actuales, evidenciando el estado del trabajo en el Checkpoint de la Semana 17.

## Done (Completado)
- [x] **Construcción de Árbol Sintáctico Léxico (AST):** Conversión de RegEx a AST con cálculo de `firstpos`, `lastpos`, y `anulabilidad` (`RegexToAST.js`).
- [x] **Generación Directa de DFA:** Algoritmo que calcula el autómata mínimo sin pasar por AFN (`DirectDFA.js`).
- [x] **Code Generator Léxico:** Output en Python funcional que procesa archivos y retorna tokens (`Generator.js`, `lexer.py`).
- [x] **Lectura de archivos `.yal`:** Extracción robusta de reglas y variables.

## In Progress (En Curso)
- [ ] **Arquitectura del Generador Sintáctico:** Definir responsabilidades de módulos y flujo de datos entre el frontend (lectura de `.yalp`) y el backend (generación de tablas).
- [ ] **Scaffolding de Módulos:** Crear la estructura de carpetas (`parser_generator/`) y plantillas base de los algoritmos LR.

## To Do (Por Hacer)
- [ ] **Lector de `.yalp`:** Procesar el archivo de la gramática y extraer terminales y producciones.
- [ ] **Algoritmo Closure & Goto:** Implementar lógica para calcular estados de items LR(0).
- [ ] **Generador de Tablas (ACTION / GOTO):** Algoritmo que pobla matrices a partir del conjunto de estados canónicos.
- [ ] **Detección de Conflictos:** Algoritmo para alertar sobre Shift/Reduce y Reduce/Reduce en la consola.
- [ ] **Generador de `parser.py`:** Plantilla en Python que carga las tablas e importa `lexer.py` para analizar cadenas de texto reales.
