# Generado por YAPar
import sys

try:
    from thelexer import tokenize as _tokenize
    
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
        self.action = [
            {
                "INT_LIT": "S1"
            },
            {
                "$": "R7",
                "PLUS": "R7",
                "MINUS": "R7",
                "TIMES": "R7",
                "DIV": "R7"
            },
            {
                "PLUS": "S5",
                "MINUS": "S6",
                "$": "ACC"
            },
            {
                "TIMES": "S7",
                "DIV": "S8",
                "$": "R3",
                "PLUS": "R3",
                "MINUS": "R3"
            },
            {
                "$": "R6",
                "PLUS": "R6",
                "MINUS": "R6",
                "TIMES": "R6",
                "DIV": "R6"
            },
            {
                "INT_LIT": "S1"
            },
            {
                "INT_LIT": "S1"
            },
            {
                "INT_LIT": "S1"
            },
            {
                "INT_LIT": "S1"
            },
            {
                "TIMES": "S7",
                "DIV": "S8",
                "$": "R1",
                "PLUS": "R1",
                "MINUS": "R1"
            },
            {
                "TIMES": "S7",
                "DIV": "S8",
                "$": "R2",
                "PLUS": "R2",
                "MINUS": "R2"
            },
            {
                "$": "R4",
                "PLUS": "R4",
                "MINUS": "R4",
                "TIMES": "R4",
                "DIV": "R4"
            },
            {
                "$": "R5",
                "PLUS": "R5",
                "MINUS": "R5",
                "TIMES": "R5",
                "DIV": "R5"
            }
        ]
        self.goto = [
            {
                "E": 2,
                "T": 3,
                "F": 4
            },
            {},
            {},
            {},
            {},
            {
                "T": 9,
                "F": 4
            },
            {
                "T": 10,
                "F": 4
            },
            {
                "F": 11
            },
            {
                "F": 12
            },
            {},
            {},
            {},
            {}
        ]
        self.productions = [
            {
                "head": "E'",
                "len": 1
            },
            {
                "head": "E",
                "len": 3
            },
            {
                "head": "E",
                "len": 3
            },
            {
                "head": "E",
                "len": 1
            },
            {
                "head": "T",
                "len": 3
            },
            {
                "head": "T",
                "len": 3
            },
            {
                "head": "T",
                "len": 1
            },
            {
                "head": "F",
                "len": 1
            }
        ]

    def execute_action(self, prod_idx, args):
        if False: pass
        elif prod_idx == 0:
            return args[0]
        elif prod_idx == 1:
            return args[0] + args[2]
        elif prod_idx == 2:
            return args[0] - args[2]
        elif prod_idx == 3:
            return args[0]
        elif prod_idx == 4:
            return args[0] * args[2]
        elif prod_idx == 5:
            return args[0] / args[2]
        elif prod_idx == 6:
            return args[0]
        elif prod_idx == 7:
            return args[0]
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