/**
 * Swibe Language Lexer
 * Tokenizes Swibe source code
 */

const TokenType = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',

  // Core language keywords
  FN: 'FN',
  STRUCT: 'STRUCT',
  ENUM: 'ENUM',
  IF: 'IF',
  ELSE: 'ELSE',
  MATCH: 'MATCH',
  CASE: 'CASE',
  DEFAULT: 'DEFAULT',
  ASYNC: 'ASYNC',
  AWAIT: 'AWAIT',
  SPAWN: 'SPAWN',
  MUT: 'MUT',
  PROTOCOL: 'PROTOCOL',
  TRAIT: 'TRAIT',
  IMPL: 'IMPL',
  USE: 'USE',
  RETURN: 'RETURN',
  BREAK: 'BREAK',
  CONTINUE: 'CONTINUE',
  FOR: 'FOR',
  WHILE: 'WHILE',
  LOOP: 'LOOP',
  IN: 'IN',
  PRINTLN: 'PRINTLN',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NIL: 'NIL',
  NONE: 'NONE',
  SOME: 'SOME',
  OPTION: 'OPTION',
  RESULT: 'RESULT',
  LET: 'LET',
  CONST: 'CONST',

  // AI integration keywords
  AI: 'AI',
  RAG: 'RAG',
  EMBED: 'EMBED',
  IMPORT: 'IMPORT',        // import statement

  // 5 CORE PRIMITIVES - Agent-native keywords
  BIRTH: 'BIRTH',        // Agent genesis/initialization
  THINK: 'THINK',        // Natural language interface
  ETHICS: 'ETHICS',      // Governance constraints
  PERMISSION: 'PERMISSION', // Access control
  RECEIPT: 'RECEIPT',    // Audit proof trail

  // PROMPT & VOICE (AI generation)
  PROMPT: 'PROMPT',      // %%
  VOICE: 'VOICE',        // [voice: ...]
  AT_TARGET: 'AT_TARGET', // @target

  // Operators
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  ASSIGN: 'ASSIGN',      // =
  PIPE: 'PIPE',          // |>
  BAR: 'BAR',            // |
  ARROW: 'ARROW',        // ->
  FAT_ARROW: 'FAT_ARROW', // =>
  EQ: 'EQ',              // ==
  NE: 'NE',              // !=
  LT: 'LT',              // <
  LE: 'LE',              // <=
  GT: 'GT',              // >
  GE: 'GE',              // >=
  AND: 'AND',            // &&
  OR: 'OR',              // ||
  NOT: 'NOT',            // !
  AMPERSAND: 'AMPERSAND', // &
  DOUBLE_COLON: 'DOUBLE_COLON', // ::

  // Delimiters
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  COMMA: 'COMMA',
  DOT: 'DOT',
  COLON: 'COLON',
  SEMICOLON: 'SEMICOLON',
  QUESTION: 'QUESTION',

  EOF: 'EOF',
};

class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, ${this.value}, ${this.line}:${this.column})`;
  }
}

class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    
    // Track structural state
    this.braceDepth = 0;
    this.inString = false;
    this.stringChar = null;
  }

  current() {
    return this.source[this.pos];
  }

  peek(offset = 1) {
    if (this.pos + offset >= this.source.length) return null;
    return this.source[this.pos + offset];
  }

  advance() {
    const char = this.current();
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  skipWhitespace() {
    while (this.pos < this.source.length && /\s/.test(this.current())) {
      this.advance();
    }
  }

  readNumber() {
    let num = '';
    while (this.pos < this.source.length && /\d/.test(this.current())) {
      num += this.advance();
    }
    if (this.current() === '.' && /\d/.test(this.peek())) {
      num += this.advance();
      while (this.pos < this.source.length && /\d/.test(this.current())) {
        num += this.advance();
      }
    }
    return parseFloat(num);
  }

  readString(quote) {
    let str = '';
    this.advance(); // consume opening quote
    while (this.pos < this.source.length && this.current() !== quote) {
      if (this.current() === '\\') {
        this.advance();
        const escaped = this.advance();
        if (escaped === 'n') str += '\n';
        else if (escaped === 't') str += '\t';
        else str += escaped;
      } else {
        str += this.advance();
      }
    }
    this.expect(quote); // consume closing quote
    return str;
  }

  readIdentifier() {
    let ident = '';
    while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.current())) {
      ident += this.advance();
    }
    return ident;
  }

  readComment() {
    while (this.pos < this.source.length && this.current() !== '\n') {
      this.advance();
    }
  }

  readPrompt() {
    this.advance(); // %
    this.advance(); // %
    let prompt = '';
    while (this.pos < this.source.length && !(this.current() === '%' && this.peek() === '%')) {
      prompt += this.advance();
    }
    this.advance(); // %
    this.advance(); // %
    return prompt.trim();
  }

  readVoicePrompt() {
    // [[voice: ...]]
    this.advance(); // [
    this.advance(); // [
    let voice = '';
    while (this.pos < this.source.length && !(this.current() === ']' && this.peek() === ']')) {
      voice += this.advance();
    }
    this.advance(); // ]
    this.advance(); // ]
    return voice.trim();
  }

  expect(char) {
    if (this.current() !== char) {
      throw new Error(`Expected '${char}', got '${this.current()}' at ${this.line}:${this.column}`);
    }
    this.advance();
  }

  keywords = {
    // Core language
    fn: TokenType.FN,
    struct: TokenType.STRUCT,
    enum: TokenType.ENUM,
    if: TokenType.IF,
    else: TokenType.ELSE,
    match: TokenType.MATCH,
    case: TokenType.CASE,
    default: TokenType.DEFAULT,
    async: TokenType.ASYNC,
    await: TokenType.AWAIT,
    spawn: TokenType.SPAWN,
    mut: TokenType.MUT,
    protocol: TokenType.PROTOCOL,
    trait: TokenType.TRAIT,
    impl: TokenType.IMPL,
    use: TokenType.USE,
    return: TokenType.RETURN,
    break: TokenType.BREAK,
    continue: TokenType.CONTINUE,
    for: TokenType.FOR,
    while: TokenType.WHILE,
    loop: TokenType.LOOP,
    in: TokenType.IN,
    println: TokenType.PRINTLN,
    true: TokenType.TRUE,
    false: TokenType.FALSE,
    nil: TokenType.NIL,
    none: TokenType.NONE,
    some: TokenType.SOME,
    Option: TokenType.OPTION,
    Result: TokenType.RESULT,
    let: TokenType.LET,
    const: TokenType.CONST,

    // AI integration
    ai: TokenType.AI,
    rag: TokenType.RAG,
    embed: TokenType.EMBED,
    import: TokenType.IMPORT,

    // 5 CORE PRIMITIVES (only these agent-specific keywords remain)
    birth: TokenType.BIRTH,
    think: TokenType.THINK,
    ethics: TokenType.ETHICS,
    permission: TokenType.PERMISSION,
    receipt: TokenType.RECEIPT,

    // Deprecated - maintained for backward compatibility, should use stdlib instead
    // See: stdlib/identity, stdlib/metabolism, stdlib/witness, stdlib/memory,
    //      stdlib/swarm, stdlib/hire, stdlib/receipt
  };

  addToken(type, value = null) {
    const token = new Token(type, value, this.tokenLine, this.tokenColumn);
    this.tokens.push(token);
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();

      if (this.pos >= this.source.length) break;

      this.tokenLine = this.line;
      this.tokenColumn = this.column;
      const char = this.current();

      // Comments
      if ((char === '-' && this.peek() === '-') || (char === '/' && this.peek() === '/')) {
        this.readComment();
        continue;
      }

      // Prompt
      if (char === '%' && this.peek() === '%') {
        const prompt = this.readPrompt();
        this.addToken(TokenType.PROMPT, prompt);
        continue;
      }

      // Voice prompts
      if (char === '[' && this.source.substring(this.pos, this.pos + 6) === '[voice') {
        const voice = this.readVoicePrompt();
        this.addToken(TokenType.VOICE, voice);
        continue;
      }

      // Numbers
      if (/\d/.test(char)) {
        const num = this.readNumber();
        this.addToken(TokenType.NUMBER, num);
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        const str = this.readString(char);
        this.addToken(TokenType.STRING, str);
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const ident = this.readIdentifier();
        const type = this.keywords[ident] || TokenType.IDENTIFIER;
        this.addToken(type, ident);
        continue;
      }

      // Operators and delimiters
      if (char === '+') {
        this.addToken(TokenType.PLUS, '+');
        this.advance();
      } else if (char === '-') {
        if (this.peek() === '>') {
          this.addToken(TokenType.ARROW, '->');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.MINUS, '-');
          this.advance();
        }
      } else if (char === '*') {
        this.addToken(TokenType.STAR, '*');
        this.advance();
      } else if (char === '/') {
        this.addToken(TokenType.SLASH, '/');
        this.advance();
      } else if (char === '%') {
        this.addToken(TokenType.PERCENT, '%');
        this.advance();
      } else if (char === '=') {
        if (this.peek() === '=') {
          this.addToken(TokenType.EQ, '==');
          this.advance();
          this.advance();
        } else if (this.peek() === '>') {
          this.addToken(TokenType.FAT_ARROW, '=>');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.ASSIGN, '=');
          this.advance();
        }
      } else if (char === '!') {
        if (this.peek() === '=') {
          this.addToken(TokenType.NE, '!=');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.NOT, '!');
          this.advance();
        }
      } else if (char === '<') {
        if (this.peek() === '=') {
          this.addToken(TokenType.LE, '<=');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.LT, '<');
          this.advance();
        }
      } else if (char === '>') {
        if (this.peek() === '=') {
          this.addToken(TokenType.GE, '>=');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.GT, '>');
          this.advance();
        }
      } else if (char === '&') {
        if (this.peek() === '&') {
          this.addToken(TokenType.AND, '&&');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.AMPERSAND, '&');
          this.advance();
        }
      } else if (char === '|') {
        if (this.peek() === '>') {
          this.addToken(TokenType.PIPE, '|>');
          this.advance();
          this.advance();
        } else if (this.peek() === '|') {
          this.addToken(TokenType.OR, '||');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.BAR, '|');
          this.advance();
        }
      } else if (char === ':') {
        if (this.peek() === ':') {
          this.addToken(TokenType.DOUBLE_COLON, '::');
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.COLON, ':');
          this.advance();
        }
      } else if (char === ';') {
        this.addToken(TokenType.SEMICOLON, ';');
        this.advance();
      } else if (char === ',') {
        this.addToken(TokenType.COMMA, ',');
        this.advance();
      } else if (char === '.') {
        this.addToken(TokenType.DOT, '.');
        this.advance();
      } else if (char === '?') {
        this.addToken(TokenType.QUESTION, '?');
        this.advance();
      } else if (char === '#') {
        if (this.peek() === '[') {
          // Attribute macro or decorator syntax, ignore for now
          this.advance(); // '#'
          this.advance(); // '['
          while (this.current() && this.current() !== ']') {
            this.advance();
          }
          if (this.current() === ']') this.advance();
          continue;
        }
        throw new Error(`Unexpected character: ${char} at ${this.line}:${this.column}`);
      } else if (char === '(') {
        this.addToken(TokenType.LPAREN, '(');
        this.advance();
      } else if (char === ')') {
        this.addToken(TokenType.RPAREN, ')');
        this.advance();
      } else if (char === '{') {
        this.addToken(TokenType.LBRACE, '{');
        this.braceDepth++;
        this.advance();
      } else if (char === '}') {
        this.addToken(TokenType.RBRACE, '}');
        this.braceDepth--;
        this.advance();
      } else if (char === '[') {
        this.addToken(TokenType.LBRACKET, '[');
        this.advance();
      } else if (char === ']') {
        this.addToken(TokenType.RBRACKET, ']');
        this.advance();
      } else if (char === '\u2192') {  // →
        this.addToken(TokenType.ARROW, '→');
        this.advance();
      } else if (char === '@') {
        this.advance();
        if (this.current() && /[a-zA-Z_]/.test(this.current())) {
          const ident = this.readIdentifier();
          this.addToken(TokenType.AT_TARGET, ident);
        } else {
          this.addToken(TokenType.AT_TARGET, null);
        }
      } else {
        throw new Error(`Unexpected character: ${char} at ${this.line}:${this.column}`);
      }
    }

    this.addToken(TokenType.EOF, null);
    return this.tokens;
  }
}

export { Lexer, TokenType, Token };
