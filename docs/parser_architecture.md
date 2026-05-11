# Arquitectura Base del Generador de Analizadores Sintácticos

El generador de analizadores sintácticos seguirá una arquitectura modular basada en el pipeline teórico de la construcción de parsers Bottom-Up (LR(0), SLR(1), LALR(1)). Actualmente, esta arquitectura está en fase de diseño.

## 1. Módulos y Responsabilidades

### 1.1. Lector de Gramática (`GrammarReader.js`)
**Responsabilidad:** Leer el archivo `.yalp` (formato YAPar) y convertirlo en una estructura de datos manejable.
- Extrae tokens (`%token`) y tokens a ignorar (`IGNORE`).
- Separa la sección de declaraciones y producciones mediante `%%`.
- Extrae las producciones respetando la sintaxis de YAPar (uso de `:`, `|` y `;`).

### 1.2. Modelo Interno y Gramática Aumentada
**Responsabilidad:** Representar las producciones en memoria.
- Crea el símbolo inicial aumentado (ej. `S' -> S`).
- Asigna un identificador único a cada símbolo (Terminales y No Terminales).
- Mantiene un registro de las producciones numeradas para las operaciones de `Reduce`.

### 1.3. Generador del Autómata (`LR0Automaton.js`)
Este módulo es el corazón del analizador LR(0). Sus responsabilidades incluyen:
- **Items LR(0):** Representación de una producción con un punto `.` que indica cuánto de la regla se ha visto. (ej. `A -> alpha . beta`).
- **Closure:** Operación para calcular la cerradura de un conjunto de items. Si el punto precede a un No Terminal, se agregan sus producciones.
- **Goto:** Calcula las transiciones entre conjuntos de items (estados) al leer un símbolo `X`.
- **Autómata Base:** Conjunto de estados $C = \{I_0, I_1, ..., I_n\}$ generados iterativamente hasta que no haya nuevos estados.

### 1.4. Generador de Tablas y Conflictos (`ParserGenerator.js`)
**Responsabilidad:** Convertir el autómata en las tablas `ACTION` y `GOTO`.
- **GOTO:** Mapea las transiciones de estados con No Terminales.
- **ACTION:** Mapea las transiciones (Shift), las reducciones (Reduce) y la aceptación (Accept) basadas en Terminales.
- **Detector de Conflictos:** Módulo encargado de identificar celdas en la tabla `ACTION` con múltiples entradas (Shift/Reduce o Reduce/Reduce) y reportarlas.

### 1.5. Generador de Código Fuente (`parser.py`)
**Responsabilidad:** Emitir el código Python del analizador. El código generado incluirá:
- Las tablas `ACTION` y `GOTO` embebidas.
- La lógica del algoritmo Pushdown Automaton (Pila de estados y Pila de símbolos).
- La importación del analizador léxico (`lexer.py`).

## 2. Flujo de Integración (Sintáctico + Léxico)

El flujo en tiempo de ejecución del `parser.py` será el siguiente:

1. El usuario ejecuta `python parser.py <input.txt>`.
2. `parser.py` inicializa las tablas estáticas generadas por Node.
3. Importa la función de escaneo desde `lexer.py` generado en la fase M2.
4. Entra en un ciclo de parsing:
   - Llama a `lexer.getToken()` para obtener el próximo par `(tipo_token, valor)`.
   - Consulta el estado en el tope de la pila y el `tipo_token` en la tabla `ACTION`.
   - Realiza la acción `Shift`, `Reduce` o reporta un `Error de Sintaxis`.
   - Si es `Reduce`, saca elementos de la pila y usa la tabla `GOTO` para el nuevo estado.
   - Si la acción es `Accept`, el archivo de entrada es válido.
