/**
 * ParserGenerator.js
 * 
 * Módulo principal que orquesta la generación del analizador sintáctico.
 * 
 * Responsabilidades:
 * 1. A partir del Autómata LR(0), construir las tablas ACTION y GOTO.
 * 2. Detectar conflictos Shift/Reduce y Reduce/Reduce.
 * 3. Emitir el código Python final (parser.py) inyectando las tablas 
 *    e importando el lexer.py generado en la fase anterior.
 * 
 * Estado: En diseño (Arquitectura)
 */

class ParserGenerator {
    constructor(automaton, grammar, sets) {
        this.automaton = automaton;
        this.grammar = grammar;
        this.sets = sets;
        this.actionTable = [];
        this.gotoTable = [];
        this.conflicts = [];
    }

    /**
     * Construye las tablas ACTION y GOTO para el parser SLR(1)
     */
    buildTables() {
        const { states, transitions } = this.automaton.getAutomaton();

        // Inicializar tablas
        states.forEach(() => {
            this.actionTable.push({});
            this.gotoTable.push({});
        });

        // 1. Procesar transiciones (Shift y Goto)
        transitions.forEach(t => {
            if (this.grammar.terminals.includes(t.symbol)) {
                this.actionTable[t.from][t.symbol] = 'S' + t.to;
            } else if (this.grammar.nonTerminals.includes(t.symbol)) {
                this.gotoTable[t.from][t.symbol] = t.to;
            }
        });

        // 2. Procesar reducciones (Reduce y Accept)
        states.forEach((stateItems, i) => {
            stateItems.forEach(item => {
                const prod = this.grammar.productions[item.prodIndex];
                
                // Si el punto está al final (A -> alpha .)
                if (item.dotPos === prod.body.length || (prod.body.length === 1 && prod.body[0] === 'epsilon')) {
                    if (prod.head === this.grammar.startSymbol) {
                        this.actionTable[i]['$'] = 'ACC';
                    } else {
                        const followA = this.sets.follow.get(prod.head);
                        if (followA) {
                            followA.forEach(term => {
                                const existing = this.actionTable[i][term];
                                if (existing && existing !== 'R' + item.prodIndex) {
                                    this.conflicts.push(`Conflict at state ${i} on '${term}': ${existing} vs R${item.prodIndex}`);
                                } else {
                                    this.actionTable[i][term] = 'R' + item.prodIndex;
                                }
                            });
                        }
                    }
                }
            });
        });
    }

    getTables() {
        return {
            action: this.actionTable,
            goto: this.gotoTable,
            conflicts: this.conflicts
        };
    }

    // TODO: Emitir el archivo parser.py basado en plantilla
    generateParserFile(outputPath) {
        throw new Error("Not implemented yet (To be done in Python integration)");
    }
}

module.exports = ParserGenerator;
