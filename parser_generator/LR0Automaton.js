/**
 * LR0Automaton.js
 * 
 * Módulo responsable de construir el autómata de estados finitos determinista
 * basado en conjuntos de ítems LR(0).
 * 
 * Responsabilidades:
 * 1. Calcular la operación CLOSURE(I).
 * 2. Calcular la operación GOTO(I, X).
 * 3. Construir la colección canónica de conjuntos de ítems LR(0).
 * 
 * Estado: En diseño (Arquitectura)
 */

class LR0Automaton {
    constructor(grammar) {
        this.grammar = grammar;
        this.states = [];
        this.transitions = [];
    }

    /**
     * Calcula la cerradura (CLOSURE) de un conjunto de ítems LR(0)
     * @param {Array} items Array de objetos de la forma { prodIndex: 0, dotPos: 0 }
     * @returns {Array} Conjunto de ítems expandido
     */
    closure(items) {
        const closureSet = [...items]; // Copia inicial
        let added = true;

        while (added) {
            added = false;
            for (let i = 0; i < closureSet.length; i++) {
                const item = closureSet[i];
                const prod = this.grammar.productions[item.prodIndex];
                
                // Si el punto no ha llegado al final de la producción
                if (item.dotPos < prod.body.length) {
                    const symbolAfterDot = prod.body[item.dotPos];
                    
                    // Si el símbolo es un No Terminal
                    if (this.grammar.nonTerminals.includes(symbolAfterDot)) {
                        // Buscar todas las producciones que derivan de ese No Terminal
                        for (let j = 0; j < this.grammar.productions.length; j++) {
                            if (this.grammar.productions[j].head === symbolAfterDot) {
                                // Agregar el ítem con el punto al inicio si no existe ya
                                const exists = closureSet.some(existing => 
                                    existing.prodIndex === j && existing.dotPos === 0
                                );
                                
                                if (!exists) {
                                    closureSet.push({ prodIndex: j, dotPos: 0 });
                                    added = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return closureSet;
    }

    /**
     * Calcula la operación GOTO(I, X)
     * @param {Array} items Conjunto base de ítems
     * @param {String} symbol Símbolo a transicionar (X)
     * @returns {Array} Nuevo conjunto de ítems resultante del GOTO
     */
    goto(items, symbol) {
        const gotoItems = [];
        
        items.forEach(item => {
            const prod = this.grammar.productions[item.prodIndex];
            if (item.dotPos < prod.body.length && prod.body[item.dotPos] === symbol) {
                // Mover el punto una posición a la derecha
                gotoItems.push({ prodIndex: item.prodIndex, dotPos: item.dotPos + 1 });
            }
        });

        // Retornar la cerradura del nuevo conjunto
        return this.closure(gotoItems);
    }

    // TODO: Construir estados (Colección canónica)
    build() {
        // La implementación completa de build() se hará en la siguiente fase (Week 19)
        console.log("Building states... (To be implemented)");
    }

    getAutomaton() {
        return { states: this.states, transitions: this.transitions };
    }
}

module.exports = LR0Automaton;
