/**
 * GrammarReader.js
 * 
 * Módulo responsable de procesar la sintaxis del archivo .yalp (YACC format).
 * 
 * Responsabilidades:
 * 1. Extraer tokens (%token) e ignorados (IGNORE).
 * 2. Procesar comentarios en bloque y separar secciones con '%%'.
 * 3. Extraer el símbolo inicial (START) y procesar producciones en formato YAPar 
 *    (ej. rule: rule_a TOKEN | rule_b ;).
 * 
 * Estado: En diseño (Arquitectura preparada para YAPar)
 */

class GrammarReader {
    constructor() {
        this.terminals = new Set();
        this.nonTerminals = new Set();
        this.productions = [];
        this.startSymbol = null;
    }

    /**
     * Construye el modelo interno a partir de una estructura de producciones JSON.
     * En una fase posterior, el lector del archivo .yalp llamará a esta función.
     * @param {Array} rawProductions Array de formato { head: "E", body: ["E", "+", "T"] }
     * @param {String} startSymbol Símbolo inicial (opcional, por defecto el primero)
     */
    buildFromStructure(rawProductions, startSymbol = null) {
        if (!rawProductions || rawProductions.length === 0) {
            throw new Error("No productions provided.");
        }
        
        this.productions = rawProductions;
        this.startSymbol = startSymbol || rawProductions[0].head;

        // Fase 1: Identificar todos los No Terminales (lados izquierdos)
        rawProductions.forEach(prod => {
            this.nonTerminals.add(prod.head);
        });

        // Fase 2: Todo símbolo en el cuerpo que no sea No Terminal, es Terminal
        rawProductions.forEach(prod => {
            prod.body.forEach(symbol => {
                // 'ε' o 'epsilon' es la cadena vacía, no es terminal
                if (!this.nonTerminals.has(symbol) && symbol !== 'ε') {
                    this.terminals.add(symbol);
                }
            });
        });
        
        // Agregar un símbolo especial de fin de cadena (Augmented Grammar)
        if (!this.terminals.has('$')) {
            this.terminals.add('$');
        }
    }

    getGrammar() {
        return {
            terminals: Array.from(this.terminals),
            nonTerminals: Array.from(this.nonTerminals),
            productions: this.productions,
            startSymbol: this.startSymbol
        };
    }
}

module.exports = GrammarReader;
