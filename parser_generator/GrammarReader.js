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
    constructor(filePath) {
        this.filePath = filePath;
        this.tokens = [];
        this.productions = [];
        this.startSymbol = null;
    }

    // TODO: Implementar lector de archivo línea por línea
    parse() {
        throw new Error("Not implemented yet");
    }

    // TODO: Exponer getter del modelo interno de la gramática
    getGrammar() {
        return { tokens: this.tokens, productions: this.productions, startSymbol: this.startSymbol };
    }
}

module.exports = GrammarReader;
