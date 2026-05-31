/**
 * AutomatonVisualizer.js
 * 
 * Genera una representación visual del Autómata (LR0 o LALR)
 * en formato DOT (Graphviz), cumpliendo con el requisito de entrega.
 */

const fs = require('fs');

class AutomatonVisualizer {
    /**
     * Escribe un archivo .dot con el autómata.
     */
    static generateDot(automaton, grammar, outputPath, title = "Automata LR") {
        const { states, transitions } = automaton;

        let dot = `digraph "${title}" {\n`;
        dot += `    rankdir=LR;\n`;
        dot += `    node [shape=record, fontname="Courier New", fontsize=10];\n\n`;

        // Generar nodos (estados)
        states.forEach((stateItems, idx) => {
            // Formatear los items del estado
            let itemsHtml = stateItems.map(item => {
                const prod = grammar.productions[item.prodIndex];
                let lhs = prod.head;
                let rhs = [...prod.body];
                rhs.splice(item.dotPos, 0, "•");
                
                let line = `${lhs} &rarr; ${rhs.join(' ')}`;
                if (item.lookaheads && item.lookaheads.length > 0) {
                    line += ` , ${item.lookaheads.join('/')}`;
                }
                
                // Escapar caracteres especiales de HTML/DOT
                line = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return line;
            }).join('\\n');

            dot += `    I${idx} [label="{ Estado ${idx} | ${itemsHtml} }"];\n`;
        });

        dot += `\n`;

        // Generar aristas (transiciones)
        transitions.forEach(t => {
            let symbol = t.symbol.replace(/"/g, '\\"');
            dot += `    I${t.from} -> I${t.to} [label="${symbol}"];\n`;
        });

        dot += `}\n`;

        fs.writeFileSync(outputPath, dot);
        console.log(`Grafo generado en: ${outputPath}`);
    }
}

module.exports = AutomatonVisualizer;
