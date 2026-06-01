/**
 * ParserGenerator.js
 * 
 * Módulo principal que orquesta la generación del analizador sintáctico.
 */

class ParserGenerator {
    constructor(automaton, grammar, sets, mode = 'SLR') {
        this.automaton = automaton;
        this.grammar = grammar;
        this.sets = sets;
        this.mode = mode;
        this.actionTable = [];
        this.gotoTable = [];
        this.conflicts = [];
    }

    buildTables() {
        const { states, transitions } = this.automaton.getAutomaton();

        states.forEach(() => {
            this.actionTable.push({});
            this.gotoTable.push({});
        });

        transitions.forEach(t => {
            if (this.grammar.terminals.includes(t.symbol)) {
                this.actionTable[t.from][t.symbol] = 'S' + t.to;
            } else if (this.grammar.nonTerminals.includes(t.symbol)) {
                this.gotoTable[t.from][t.symbol] = t.to;
            }
        });

        states.forEach((stateItems, i) => {
            stateItems.forEach(item => {
                const prod = this.grammar.productions[item.prodIndex];
                
                if (item.dotPos === prod.body.length || (prod.body.length === 1 && prod.body[0] === 'epsilon')) {
                    if (prod.head === this.grammar.startSymbol) {
                        this.actionTable[i]['$'] = 'ACC';
                    } else {
                        let reduceSymbols = [];
                        if (this.mode === 'LALR') {
                            reduceSymbols = item.lookaheads || [];
                        } else {
                            const followA = this.sets.follow.get(prod.head);
                            reduceSymbols = followA ? Array.from(followA) : [];
                        }

                        reduceSymbols.forEach(term => {
                            const existing = this.actionTable[i][term];
                            if (existing && existing !== 'R' + item.prodIndex) {
                                this.conflicts.push(`Conflict at state ${i} on '${term}': ${existing} vs R${item.prodIndex}`);
                            } else {
                                this.actionTable[i][term] = 'R' + item.prodIndex;
                            }
                        });
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

    generateParserFile(outputPath, lexerModule = 'thelexer') {
        const fs = require('fs');
        const actionTableStr = JSON.stringify(this.actionTable, null, 4);
        const gotoTableStr = JSON.stringify(this.gotoTable, null, 4);
        
        const productions = this.grammar.productions.map(p => ({
            head: p.head,
            len: (p.body.length === 1 && p.body[0] === 'epsilon') ? 0 : p.body.length
        }));
        const productionsStr = JSON.stringify(productions, null, 4);
        const startSymbol = this.grammar.startSymbol;

        // Generar el bloque de ejecución de acciones semánticas
        const actionCodes = this.grammar.productions.map((p, idx) => {
            let act = p.action || "return None";
            // Reemplazar $1, $2 por args[0], args[1]
            act = act.replace(/\$(\d+)/g, (match, num) => `args[${parseInt(num)-1}]`);
            let indentedAct = act.split('\n').map(line => '            ' + line).join('\n');
            return `        elif prod_idx == ${idx}:\n${indentedAct}`;
        }).join('\n');

        const pythonCode = `
# Generado por YAPar
import sys

try:
    from ${lexerModule} import tokenize as _tokenize
    
    def get_tokens(text):
        tokens_list = _tokenize(text)
        if tokens_list is not None:
            for raw_token in tokens_list:
                if isinstance(raw_token, str) and "(" in raw_token and raw_token.endswith(")"):
                    idx = raw_token.index("(")
                    t_type = raw_token[:idx]
                    t_val = raw_token[idx+2:-2] # Elimina (" y ")
                    
                    if t_type == "INT_LIT" or t_type == "FLOAT_LIT":
                        try:
                            t_val = float(t_val) if "." in t_val else int(t_val)
                        except ValueError:
                            pass
                    
                    yield (t_type, t_val)
                else:
                    yield (raw_token, raw_token)
        yield ('$', '$')

except ImportError:
    # Dummy
    def get_tokens(text):
        for char in text.split():
            yield ('TOKEN', char)
        yield ('$', '$')

class Parser:
    def __init__(self):
        self.action = ${actionTableStr.replace(/\n/g, '\n        ')}
        self.goto = ${gotoTableStr.replace(/\n/g, '\n        ')}
        self.productions = ${productionsStr.replace(/\n/g, '\n        ')}

    def execute_action(self, prod_idx, args):
        if False: pass
${actionCodes}
        else:
            return None

    def parse(self, tokens_generator):
        state_stack = [0]
        value_stack = [None]
        
        lookahead = next(tokens_generator, None)

        def get_token_type(tok):
            if tok is None: return '$'
            if isinstance(tok, tuple):
                return tok[0] # The token type
            return tok

        def get_token_val(tok):
            if tok is None: return None
            if isinstance(tok, tuple):
                return tok[1] if len(tok) > 1 else tok[0]
            return tok

        while True:
            state = state_stack[-1]
            a = get_token_type(lookahead)

            action = self.action[state].get(a)
            
            if action is None:
                print(f"Error sintactico en estado {state} con token '{a}'")
                return False

            if action.startswith('S'):
                new_state = int(action[1:])
                state_stack.append(new_state)
                value_stack.append(get_token_val(lookahead))
                # print(f"Shift a estado {new_state} con token {a}")
                lookahead = next(tokens_generator, None)
            
            elif action.startswith('R'):
                prod_idx = int(action[1:])
                prod = self.productions[prod_idx]
                length = prod["len"]
                
                args = []
                if length > 0:
                    args = value_stack[-length:]
                    del state_stack[-length:]
                    del value_stack[-length:]
                
                result = self.execute_action(prod_idx, args)
                
                top_state = state_stack[-1]
                new_state = self.goto[top_state].get(prod["head"])
                
                state_stack.append(new_state)
                value_stack.append(result)
                # print(f"Reduce por {prod['head']} -> longitud {length} (GOTO {new_state})")
            
            elif action == 'ACC':
                print("Analisis exitoso (ACC) - Cadena Aceptada")
                print("Resultado final del parser:", value_stack[-1])
                return True
            else:
                print("Accion desconocida")
                return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except FileNotFoundError:
            print(f"Archivo no encontrado: {file_path}")
            sys.exit(1)
    else:
        content = "c d d" # Cadena por defecto
        
    print("Parseando contenido...")
    tokens = get_tokens(content)
    parser = Parser()
    parser.parse(tokens)
`;
        fs.writeFileSync(outputPath, pythonCode.trim());
        console.log(`\nArchivo de parser generado en: ${outputPath}`);
    }
}

module.exports = ParserGenerator;
