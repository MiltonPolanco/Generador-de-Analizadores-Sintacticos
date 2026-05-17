/**
 * FirstAndFollow.js
 * 
 * Módulo responsable de calcular los conjuntos FIRST y FOLLOW para la gramática.
 */

class FirstAndFollow {
    constructor(grammar) {
        this.terminals = grammar.terminals;
        this.nonTerminals = grammar.nonTerminals;
        this.productions = grammar.productions;
        this.startSymbol = grammar.startSymbol;

        this.firstSets = new Map();
        this.followSets = new Map();

        // Inicializar conjuntos
        this.terminals.forEach(t => this.firstSets.set(t, new Set([t])));
        this.nonTerminals.forEach(nt => {
            this.firstSets.set(nt, new Set());
            this.followSets.set(nt, new Set());
        });

        // Regla 1 para FOLLOW: Poner '$' en el FOLLOW del start symbol
        this.followSets.get(this.startSymbol).add('$');
    }

    computeFirstSets() {
        let changed = true;
        while (changed) {
            changed = false;
            this.productions.forEach(prod => {
                const head = prod.head;
                const body = prod.body;

                const beforeSize = this.firstSets.get(head).size;

                // Si es E -> ε
                if (body.length === 1 && body[0] === 'ε') {
                    this.firstSets.get(head).add('ε');
                } else {
                    let allEpsilon = true;
                    for (let i = 0; i < body.length; i++) {
                        const symbol = body[i];
                        const symbolFirst = this.firstSets.get(symbol) || new Set();
                        
                        symbolFirst.forEach(item => {
                            if (item !== 'ε') this.firstSets.get(head).add(item);
                        });

                        if (!symbolFirst.has('ε')) {
                            allEpsilon = false;
                            break;
                        }
                    }
                    if (allEpsilon) {
                        this.firstSets.get(head).add('ε');
                    }
                }

                if (this.firstSets.get(head).size > beforeSize) {
                    changed = true;
                }
            });
        }
    }

    computeFollowSets() {
        let changed = true;
        while (changed) {
            changed = false;
            this.productions.forEach(prod => {
                const head = prod.head;
                const body = prod.body;

                for (let i = 0; i < body.length; i++) {
                    const symbol = body[i];
                    if (this.nonTerminals.includes(symbol)) {
                        const beforeSize = this.followSets.get(symbol).size;
                        
                        let nextHasEpsilon = true;
                        for (let j = i + 1; j < body.length; j++) {
                            const nextSymbol = body[j];
                            const nextFirst = this.firstSets.get(nextSymbol) || new Set();
                            
                            nextFirst.forEach(item => {
                                if (item !== 'ε') this.followSets.get(symbol).add(item);
                            });

                            if (!nextFirst.has('ε')) {
                                nextHasEpsilon = false;
                                break;
                            }
                        }

                        if (nextHasEpsilon) {
                            const headFollow = this.followSets.get(head) || new Set();
                            headFollow.forEach(item => this.followSets.get(symbol).add(item));
                        }

                        if (this.followSets.get(symbol).size > beforeSize) {
                            changed = true;
                        }
                    }
                }
            });
        }
    }

    getSets() {
        return {
            first: this.firstSets,
            follow: this.followSets
        };
    }
}

module.exports = FirstAndFollow;
