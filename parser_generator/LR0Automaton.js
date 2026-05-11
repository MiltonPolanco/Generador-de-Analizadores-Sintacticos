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

    // TODO: Implementar algoritmo para CLOSURE
    closure(items) {
        throw new Error("Not implemented yet");
    }

    // TODO: Implementar algoritmo para GOTO
    goto(items, symbol) {
        throw new Error("Not implemented yet");
    }

    // TODO: Construir estados
    build() {
        throw new Error("Not implemented yet");
    }

    getAutomaton() {
        return { states: this.states, transitions: this.transitions };
    }
}

module.exports = LR0Automaton;
