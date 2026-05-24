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

// 3. Prueba de LR0Automaton (SLR)
console.log("\n[AUTOMATA LR(0) / SLR]");
const lr0 = new LR0Automaton(grammar);
lr0.build();

const automatonSLR = lr0.getAutomaton();
console.log(`Estados generados: ${automatonSLR.states.length}`);
console.log(`Transiciones: ${automatonSLR.transitions.length}`);

// 4. Prueba de ParserGenerator (Tablas SLR(1))
console.log("\n[TABLAS SLR(1)]");
const parserGenSLR = new ParserGenerator(lr0, grammar, sets, 'SLR');
parserGenSLR.buildTables();
const tablesSLR = parserGenSLR.getTables();

console.log("Tabla ACTION:");
tablesSLR.action.forEach((row, i) => {
    if (Object.keys(row).length > 0) {
        console.log(`  Estado ${i}:`, row);
    }
});

if (tablesSLR.conflicts.length > 0) {
    console.log("\nConflictos detectados (SLR):");
    tablesSLR.conflicts.forEach(c => console.log(`  - ${c}`));
} else {
    console.log("\nConflictos detectados (SLR): 0");
}

// 5. Prueba de LALRAutomaton
const LALRAutomaton = require('./parser_generator/LALRAutomaton');
console.log("\n[AUTOMATA LALR(1)]");
const lalr = new LALRAutomaton(grammar, sets);
lalr.build();

const automatonLALR = lalr.getAutomaton();
console.log(`Estados generados tras fusionar núcleos: ${automatonLALR.states.length}`);
console.log(`Transiciones LALR: ${automatonLALR.transitions.length}`);

// 6. Prueba de ParserGenerator (Tablas LALR(1))
console.log("\n[TABLAS LALR(1)]");
const parserGenLALR = new ParserGenerator(lalr, grammar, sets, 'LALR');
parserGenLALR.buildTables();
const tablesLALR = parserGenLALR.getTables();

console.log("Tabla ACTION LALR:");
tablesLALR.action.forEach((row, i) => {
    if (Object.keys(row).length > 0) {
        console.log(`  Estado ${i}:`, row);
    }
});

if (tablesLALR.conflicts.length > 0) {
    console.log("\nConflictos detectados (LALR):");
    tablesLALR.conflicts.forEach(c => console.log(`  - ${c}`));
} else {
    console.log("\nConflictos detectados (LALR): 0");
}

// 7. Emisión de archivos Python
console.log("\n[GENERACION DE CODIGO]");
parserGenSLR.generateParserFile('parser_slr.py');
parserGenLALR.generateParserFile('parser_lalr.py');


