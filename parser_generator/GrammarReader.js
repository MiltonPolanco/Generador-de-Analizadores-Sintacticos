/**
 * GrammarReader.js
 * 
 * Módulo responsable de procesar la sintaxis del archivo .yalp (YACC format).
 * 
 * Responsabilidades:
 * 1. Extraer tokens (%token) e ignorados (IGNORE).
 * 2. Procesar comentarios en bloque y separar secciones con '%%'.
 * 3. Extraer el símbolo inicial y procesar producciones, incluyendo acciones semánticas { ... }
 */

const fs = require('fs');

class GrammarReader {
    constructor() {
        this.terminals = new Set();
        this.nonTerminals = new Set();
        this.productions = [];
        this.startSymbol = null;
        this.ignores = new Set();
    }

    /**
     * Lee y parsea físicamente un archivo .yalp
     * @param {String} filePath Ruta al archivo .yalp
     */
    readFromFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${filePath} no existe.`);
        }
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Remover comentarios /* ... */
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Separar secciones
        const parts = content.split('%%');
        if (parts.length < 2) {
            throw new Error("El archivo .yalp debe contener '%%' para separar declaraciones de producciones.");
        }
        
        const declarations = parts[0];
        const rulesPart = parts[1];
        
        this.parseDeclarations(declarations);
        this.parseRules(rulesPart);
        
        // Agregar símbolo de fin de cadena
        if (!this.terminals.has('$')) {
            this.terminals.add('$');
        }
    }

    parseDeclarations(declarations) {
        const lines = declarations.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            if (line.startsWith('%token')) {
                const tokens = line.substring(6).trim().split(/\s+/);
                tokens.forEach(t => this.terminals.add(t));
            } else if (line.startsWith('IGNORE')) {
                const ignores = line.substring(6).trim().split(/\s+/);
                ignores.forEach(i => this.ignores.add(i));
            }
        }
    }

    parseRules(rulesPart) {
        // Normalizamos espacios
        let currentRules = rulesPart.trim();
        
        // Una aproximación simple para extraer producciones de la forma:
        // Head: Body { action } | Body { action } ;
        
        // Primera pasada: registrar todos los No Terminales
        const ruleBlocks = currentRules.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (let block of ruleBlocks) {
            const headSplit = block.split(':');
            if (headSplit.length >= 2) {
                const head = headSplit[0].trim();
                this.nonTerminals.add(head);
                if (!this.startSymbol) {
                    this.startSymbol = head; // El primer No Terminal es el inicial
                }
            }
        }

        // Segunda pasada: extraer producciones
        for (let block of ruleBlocks) {
            const headSplit = block.split(':');
            if (headSplit.length < 2) throw new Error("Error de sintaxis en producciones: falta ':'");
            
            const head = headSplit[0].trim();
            
            const bodies = this.splitOptions(headSplit[1]);
            
            for (let bodyText of bodies) {
                bodyText = bodyText.trim();
                let action = "return None";
                
                const actionMatch = bodyText.match(/\{([\s\S]*)\}/);
                let symbolsText = bodyText;
                
                if (actionMatch) {
                    action = actionMatch[1].trim();
                    symbolsText = bodyText.substring(0, actionMatch.index).trim();
                }
                
                const symbols = symbolsText.split(/\s+/).filter(s => s.length > 0);
                
                this.productions.push({
                    head: head,
                    body: symbols.length > 0 ? symbols : ['epsilon'],
                    action: action
                });
                
                symbols.forEach(sym => {
                    if (sym !== 'epsilon' && !this.nonTerminals.has(sym) && !this.terminals.has(sym)) {
                        this.terminals.add(sym);
                    }
                });
            }
        }

        // Augment Grammar
        if (this.startSymbol && !this.startSymbol.endsWith("'")) {
            const augmentedStart = this.startSymbol + "'";
            this.nonTerminals.add(augmentedStart);
            this.productions.unshift({
                head: augmentedStart,
                body: [this.startSymbol],
                action: "return args[0]"
            });
            this.startSymbol = augmentedStart;
        }
    }

    // Separa por '|' respetando si estamos dentro de llaves '{' '}'
    splitOptions(text) {
        let options = [];
        let current = "";
        let braceCount = 0;
        
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (c === '{') braceCount++;
            else if (c === '}') braceCount--;
            
            if (c === '|' && braceCount === 0) {
                options.push(current);
                current = "";
            } else {
                current += c;
            }
        }
        if (current.trim().length > 0) {
            options.push(current);
        }
        return options;
    }

    /**
     * @deprecated Use readFromFile
     */
    buildFromStructure(rawProductions, startSymbol = null) {
        // ... mantener compatibilidad por si acaso ...
        this.productions = rawProductions;
        this.startSymbol = startSymbol || rawProductions[0].head;
        rawProductions.forEach(prod => this.nonTerminals.add(prod.head));
        rawProductions.forEach(prod => {
            prod.body.forEach(symbol => {
                if (!this.nonTerminals.has(symbol) && symbol !== 'epsilon' && symbol !== 'ε') {
                    this.terminals.add(symbol);
                }
            });
        });
        if (!this.terminals.has('$')) this.terminals.add('$');
    }

    getGrammar() {
        return {
            terminals: Array.from(this.terminals),
            nonTerminals: Array.from(this.nonTerminals),
            productions: this.productions,
            startSymbol: this.startSymbol,
            ignores: Array.from(this.ignores)
        };
    }
}

module.exports = GrammarReader;
