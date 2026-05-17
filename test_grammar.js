const GrammarReader = require('./parser_generator/GrammarReader');
const FirstAndFollow = require('./parser_generator/FirstAndFollow');
const LR0Automaton = require('./parser_generator/LR0Automaton');

console.log("=== INICIANDO PRUEBAS DEL PARSER (SEMANA 18) ===");

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

console.log("\n--- GRAMÁTICA ---");
console.log("Símbolo Inicial:", grammar.startSymbol);
console.log("Terminales:", grammar.terminals);
console.log("No Terminales:", grammar.nonTerminals);

// 2. Prueba de FirstAndFollow
console.log("\n--- CONJUNTOS FIRST Y FOLLOW ---");
const fAndF = new FirstAndFollow(grammar);
fAndF.computeFirstSets();
fAndF.computeFollowSets();
const sets = fAndF.getSets();

console.log("FIRST:");
sets.first.forEach((val, key) => console.log(`  FIRST(${key}) = { ${Array.from(val).join(', ')} }`));

console.log("\nFOLLOW:");
sets.follow.forEach((val, key) => console.log(`  FOLLOW(${key}) = { ${Array.from(val).join(', ')} }`));

// 3. Prueba de LR0Automaton (Closure y Goto)
console.log("\n--- OPERACIONES LR(0) ---");
const lr0 = new LR0Automaton(grammar);

// Probando Closure del item inicial: S' -> .S
const initialItem = [{ prodIndex: 0, dotPos: 0 }];
const closure0 = lr0.closure(initialItem);

console.log("Closure( { S' -> .S } ):");
closure0.forEach(item => {
    const prod = grammar.productions[item.prodIndex];
    const left = prod.body.slice(0, item.dotPos).join(' ');
    const right = prod.body.slice(item.dotPos).join(' ');
    console.log(`  ${prod.head} -> ${left} . ${right}`);
});

// Probando Goto con el símbolo 'c'
const goto_c = lr0.goto(closure0, 'c');
console.log("\nGoto( I0, 'c' ):");
goto_c.forEach(item => {
    const prod = grammar.productions[item.prodIndex];
    const left = prod.body.slice(0, item.dotPos).join(' ');
    const right = prod.body.slice(item.dotPos).join(' ');
    console.log(`  ${prod.head} -> ${left} . ${right}`);
});
