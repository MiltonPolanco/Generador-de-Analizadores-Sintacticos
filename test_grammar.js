const GrammarReader = require('./parser_generator/GrammarReader');
const FirstAndFollow = require('./parser_generator/FirstAndFollow');
const LR0Automaton = require('./parser_generator/LR0Automaton');

console.log("Generador SLR(1) - Semana 19\n=============================");

// 1. Prueba de GrammarReader
const reader = new GrammarReader();
const rawGrammar = [
    { head: "S'", body: ["S"] }, // Augmented grammar start
    { head: "S", body: ["C", "C"] },
    { head: "C", body: ["c", "C"] },
    { head: "C", body: ["d"] }
];

reader.buildFromStructure(rawGrammar, "S'");
const grammar = reader.getGrammar();

console.log("\n[GRAMATICA]");
console.log("Inicio:", grammar.startSymbol);
console.log("Terminales:", grammar.terminals);
console.log("No Terminales:", grammar.nonTerminals);

// 2. Prueba de FirstAndFollow
console.log("\n[FIRST & FOLLOW]");
const fAndF = new FirstAndFollow(grammar);
fAndF.computeFirstSets();
fAndF.computeFollowSets();
const sets = fAndF.getSets();

console.log("FIRST:");
sets.first.forEach((val, key) => console.log(`  FIRST(${key}) = { ${Array.from(val).join(', ')} }`));

console.log("\nFOLLOW:");
sets.follow.forEach((val, key) => console.log(`  FOLLOW(${key}) = { ${Array.from(val).join(', ')} }`));

const ParserGenerator = require('./parser_generator/ParserGenerator');

// 3. Prueba de LR0Automaton (Closure y Goto)
console.log("\n[AUTOMATA LR(0)]");
const lr0 = new LR0Automaton(grammar);
lr0.build();

const automaton = lr0.getAutomaton();
console.log(`Estados generados: ${automaton.states.length}`);
console.log(`Transiciones: ${automaton.transitions.length}`);

// 4. Prueba de ParserGenerator (Tablas SLR(1))
console.log("\n[TABLAS SLR(1)]");
const parserGen = new ParserGenerator(lr0, grammar, sets);
parserGen.buildTables();
const tables = parserGen.getTables();

console.log("Tabla ACTION:");
tables.action.forEach((row, i) => {
    if (Object.keys(row).length > 0) {
        console.log(`  Estado ${i}:`, row);
    }
});

console.log("\nTabla GOTO:");
tables.goto.forEach((row, i) => {
    if (Object.keys(row).length > 0) {
        console.log(`  Estado ${i}:`, row);
    }
});

if (tables.conflicts.length > 0) {
    console.log("\nConflictos detectados:");
    tables.conflicts.forEach(c => console.log(`  - ${c}`));
} else {
    console.log("\nConflictos detectados: 0");
}

