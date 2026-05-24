class LALRAutomaton {
    constructor(grammar, sets) {
        this.grammar = grammar;
        this.firstSets = sets.first; // Necesitamos FIRST para el closure LR(1)
        this.states = [];
        this.transitions = [];
    }

    // Helper para FIRST(beta * a)
    getFirstOfString(symbols) {
        let result = new Set();
        let allCanBeEmpty = true;
        for (let sym of symbols) {
            // Si es terminal, su FIRST es el mismo
            const symFirst = this.grammar.terminals.includes(sym) ? new Set([sym]) : (this.firstSets.get(sym) || new Set([sym]));
            for (let val of symFirst) {
                if (val !== 'epsilon') result.add(val);
            }
            if (!symFirst.has('epsilon')) {
                allCanBeEmpty = false;
                break;
            }
        }
        if (allCanBeEmpty) result.add('epsilon');
        return result;
    }

    hashItemLR1(item) {
        return `${item.prodIndex},${item.dotPos},${item.lookahead}`;
    }

    hashItemLR0(item) {
        return `${item.prodIndex},${item.dotPos}`;
    }

    hashStateLR1(items) {
        return items.map(i => this.hashItemLR1(i)).sort().join('|');
    }

    hashStateCore(items) {
        // Obtenemos solo los núcleos LR(0) sin duplicados
        const cores = new Set(items.map(i => this.hashItemLR0(i)));
        return Array.from(cores).sort().join('|');
    }

    closureLR1(items) {
        const closureSet = [...items];
        let added = true;

        while (added) {
            added = false;
            for (let i = 0; i < closureSet.length; i++) {
                const item = closureSet[i];
                const prod = this.grammar.productions[item.prodIndex];
                
                if (item.dotPos < prod.body.length && prod.body[0] !== 'epsilon') {
                    const symbolAfterDot = prod.body[item.dotPos];
                    
                    if (this.grammar.nonTerminals.includes(symbolAfterDot)) {
                        // beta * a
                        const beta_a = prod.body.slice(item.dotPos + 1).concat([item.lookahead]);
                        const firstBetaA = this.getFirstOfString(beta_a);
                        
                        for (let j = 0; j < this.grammar.productions.length; j++) {
                            if (this.grammar.productions[j].head === symbolAfterDot) {
                                for (let lookahead of firstBetaA) {
                                    if (lookahead !== 'epsilon') {
                                        const exists = closureSet.some(existing => 
                                            existing.prodIndex === j && 
                                            existing.dotPos === 0 && 
                                            existing.lookahead === lookahead
                                        );
                                        
                                        if (!exists) {
                                            closureSet.push({ prodIndex: j, dotPos: 0, lookahead: lookahead });
                                            added = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return closureSet;
    }

    gotoLR1(items, symbol) {
        const gotoItems = [];
        items.forEach(item => {
            const prod = this.grammar.productions[item.prodIndex];
            if (item.dotPos < prod.body.length && prod.body[item.dotPos] === symbol) {
                gotoItems.push({ prodIndex: item.prodIndex, dotPos: item.dotPos + 1, lookahead: item.lookahead });
            }
        });
        return this.closureLR1(gotoItems);
    }

    buildLR1() {
        const initialItem = [{ prodIndex: 0, dotPos: 0, lookahead: '$' }];
        const I0 = this.closureLR1(initialItem);
        
        let lr1States = [I0];
        let lr1Transitions = [];
        const stateMap = new Map();
        stateMap.set(this.hashStateLR1(I0), 0);
        
        const symbols = [...this.grammar.terminals, ...this.grammar.nonTerminals];

        let i = 0;
        while (i < lr1States.length) {
            const currentState = lr1States[i];
            
            symbols.forEach(symbol => {
                const nextStateItems = this.gotoLR1(currentState, symbol);
                
                if (nextStateItems.length > 0) {
                    const hash = this.hashStateLR1(nextStateItems);
                    let targetStateIndex;

                    if (!stateMap.has(hash)) {
                        targetStateIndex = lr1States.length;
                        lr1States.push(nextStateItems);
                        stateMap.set(hash, targetStateIndex);
                    } else {
                        targetStateIndex = stateMap.get(hash);
                    }
                    
                    lr1Transitions.push({
                        from: i,
                        symbol: symbol,
                        to: targetStateIndex
                    });
                }
            });
            i++;
        }
        return { states: lr1States, transitions: lr1Transitions };
    }

    build() {
        // 1. Construir LR(1) completo
        const lr1 = this.buildLR1();
        
        // 2. Fusionar núcleos (LALR)
        const coreMap = new Map(); // hash_core -> nuevo índice LALR
        const oldToNew = new Map(); // índice LR1 -> índice LALR
        this.states = [];
        
        lr1.states.forEach((lr1State, idx) => {
            const coreHash = this.hashStateCore(lr1State);
            if (!coreMap.has(coreHash)) {
                // Nuevo estado LALR
                const newIdx = this.states.length;
                coreMap.set(coreHash, newIdx);
                oldToNew.set(idx, newIdx);
                // Clonamos ítems para fusionar
                this.states.push([...lr1State]);
            } else {
                // Fusionar lookaheads
                const targetIdx = coreMap.get(coreHash);
                oldToNew.set(idx, targetIdx);
                
                lr1State.forEach(lr1Item => {
                    const exists = this.states[targetIdx].some(
                        i => i.prodIndex === lr1Item.prodIndex && 
                             i.dotPos === lr1Item.dotPos && 
                             i.lookahead === lr1Item.lookahead
                    );
                    if (!exists) {
                        this.states[targetIdx].push(lr1Item);
                    }
                });
            }
        });

        // 3. Re-mapear transiciones
        this.transitions = [];
        const addedTransitions = new Set();
        
        lr1.transitions.forEach(t => {
            const newFrom = oldToNew.get(t.from);
            const newTo = oldToNew.get(t.to);
            const transHash = `${newFrom},${t.symbol},${newTo}`;
            
            if (!addedTransitions.has(transHash)) {
                this.transitions.push({
                    from: newFrom,
                    symbol: t.symbol,
                    to: newTo
                });
                addedTransitions.add(transHash);
            }
        });
    }

    getAutomaton() {
        // Convertimos la estructura de items LALR a un array de objetos agrupados por núcleo, 
        // pero cada uno tendrá un arreglo de lookaheads para ParserGenerator.
        const lalrStates = this.states.map(stateItems => {
            const coreItemsMap = new Map();
            stateItems.forEach(item => {
                const key = `${item.prodIndex},${item.dotPos}`;
                if (!coreItemsMap.has(key)) {
                    coreItemsMap.set(key, { prodIndex: item.prodIndex, dotPos: item.dotPos, lookaheads: [] });
                }
                coreItemsMap.get(key).lookaheads.push(item.lookahead);
            });
            return Array.from(coreItemsMap.values());
        });

        return { states: lalrStates, transitions: this.transitions };
    }
}

module.exports = LALRAutomaton;
