/**
 * main.js
 * 
 * Punto de entrada principal para el Generador de Analizadores Sintácticos YAPar.
 * 
 * Uso: node main.js <archivo.yalp>
 */

const fs = require('fs');
const GrammarReader = require('./parser_generator/GrammarReader');
const FirstAndFollow = require('./parser_generator/FirstAndFollow');
const LR0Automaton = require('./parser_generator/LR0Automaton');
const LALRAutomaton = require('./parser_generator/LALRAutomaton');
const ParserGenerator = require('./parser_generator/ParserGenerator');
const AutomatonVisualizer = require('./parser_generator/AutomatonVisualizer');

function main() {
    console.log("       Generador Sintáctico YAPar         ");

    if (process.argv.length < 3) {
        console.error("Uso: node main.js <gramatica.yalp> [-l lexer.yal] [-o theparser]");
        process.exit(1);
    }

    let yalpFile = null;
    let lexerFile = null;
    let outputFile = 'parser';

    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i] === '-l') {
            lexerFile = process.argv[++i];
        } else if (process.argv[i] === '-o') {
            outputFile = process.argv[++i];
        } else if (!yalpFile) {
            yalpFile = process.argv[i];
        }
    }

    if (!yalpFile) {
        console.error("Uso: node main.js <gramatica.yalp> [-l lexer.yal] [-o theparser]");
        process.exit(1);
    }

    const path = require('path');
    let lexerModule = 'thelexer';
    if (lexerFile) {
        lexerModule = path.basename(lexerFile).replace(/\.[^/.]+$/, "");
    }

    // 1. Leer Gramática
    console.log(`\n[1] Leyendo gramática desde: ${yalpFile}`);
    const reader = new GrammarReader();
    try {
        reader.readFromFile(yalpFile);
    } catch (e) {
        console.error("Error leyendo .yalp:", e.message);
        process.exit(1);
    }
    const grammar = reader.getGrammar();
    console.log(`Tokens detectados: ${grammar.terminals.join(', ')}`);
    console.log(`No Terminales: ${grammar.nonTerminals.join(', ')}`);

    // 2. FIRST y FOLLOW
    console.log(`\n[2] Calculando conjuntos FIRST y FOLLOW...`);
    const faf = new FirstAndFollow(grammar);
    faf.computeFirstSets();
    faf.computeFollowSets();
    const sets = faf.getSets();

    const path = require('path');

    // ==========================================
    // 3. Generar Autómata SLR(1)
    // ==========================================
    console.log(`\n[3] Construyendo Autómata SLR(1)...`);
    const automatonSLR = new LR0Automaton(grammar);
    automatonSLR.build();

    const dotPathSLR = path.join(__dirname, "automata_slr.dot");
    console.log(`Exportando Autómata Visual SLR a ${dotPathSLR}...`);
    AutomatonVisualizer.generateDot(automatonSLR.getAutomaton(), grammar, dotPathSLR, "Automata SLR YAPar");

    const generatorSLR = new ParserGenerator(automatonSLR, grammar, sets, 'SLR');
    generatorSLR.buildTables();

    const tablesSLR = generatorSLR.getTables();
    if (tablesSLR.conflicts.length > 0) {
        console.warn(`¡CUIDADO! Se detectaron ${tablesSLR.conflicts.length} conflictos SLR(1) en la gramática.`);
    } else {
        console.log("Análisis de Tablas: 0 Conflictos SLR(1) detectados.");
    }
    generatorSLR.generateParserFile(path.join(__dirname, `${outputFile}_slr.py`), lexerModule);


    // ==========================================
    // 4. Generar Autómata LALR(1)
    // ==========================================
    console.log(`\n[4] Construyendo Autómata LALR(1)...`);
    const automatonLALR = new LALRAutomaton(grammar, sets);
    automatonLALR.build();

    const dotPathLALR = path.join(__dirname, "automata_lalr.dot");
    console.log(`Exportando Autómata Visual LALR a ${dotPathLALR}...`);
    AutomatonVisualizer.generateDot(automatonLALR.getAutomaton(), grammar, dotPathLALR, "Automata LALR YAPar");

    const generatorLALR = new ParserGenerator(automatonLALR, grammar, sets, 'LALR');
    generatorLALR.buildTables();

    const tablesLALR = generatorLALR.getTables();
    if (tablesLALR.conflicts.length > 0) {
        console.warn(`¡CUIDADO! Se detectaron ${tablesLALR.conflicts.length} conflictos LALR(1) en la gramática.`);
    } else {
        console.log("Análisis de Tablas: 0 Conflictos LALR(1) detectados.");
    }
    generatorLALR.generateParserFile(path.join(__dirname, `${outputFile}_lalr.py`), lexerModule);

    console.log("\nGeneración finalizada.");
    console.log("Para probar el parser generado:");
    console.log("  1. Asegúrate de tener YALex (thelexer.py) en el mismo directorio.");
    console.log("  2. Ejecuta: python parser.py <archivo_de_cadena.txt>");
}

main();
