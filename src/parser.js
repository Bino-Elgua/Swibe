/**
 * Swibe Language Parser
 * Builds AST from tokens
 */

import { TokenType } from './lexer.js';
import { isDeprecated, emitDeprecationWarning, getMigrationInfo } from './deprecation.js';

class ASTNode {
  constructor(type, props = {}) {
    Object.assign(this, props);
    this.type = type;
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.errors = [];
  }

  current() {
    if (this.pos >= this.tokens.length) return this.tokens[this.tokens.length - 1];
    return this.tokens[this.pos];
  }

  peek(offset = 1) {
    if (this.pos + offset >= this.tokens.length) return this.tokens[this.tokens.length - 1];
    return this.tokens[this.pos + offset];
  }

  advance() {
    const token = this.current();
    this.pos++;
    return token;
  }

  consumeSeparators() {
    while (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  isAtEnd() {
    return this.current().type === TokenType.EOF;
  }

  previous() {
    return this.tokens[this.pos - 1] || this.tokens[0];
  }

  synchronize() {
    this.advance();
    const syncTokens = [
      TokenType.FN, TokenType.SKILL,
      TokenType.STRUCT, TokenType.ENUM,
      TokenType.APP, TokenType.SWARM
    ];
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;
      if (syncTokens.includes(this.current().type)) return;
      this.advance();
    }
  }

  recoverFromError() {
    let depth = 0;
    
    while (!this.isAtEnd()) {
      const token = this.current();
      
      // Sync to next statement boundary
      if (token.type === TokenType.SEMICOLON) {
        this.advance();
        break;
      }
      
      // Handle nested block recovery
      if (token.type === TokenType.LBRACE) depth++;
      if (token.type === TokenType.RBRACE) {
        depth--;
        if (depth < 0) { this.advance(); break; }
      }
      
      this.advance();
    }
    
    return { recovered: true, skipped: this.pos };
  }

  expect(type) {
    const current = this.current();
    if (current.type !== type) {
      // Special case: keywords as valid IDENTIFIER
      const allowed = [
        TokenType.PRINTLN, TokenType.RAG, TokenType.AI, TokenType.EMBED, 
        TokenType.GOAL, TokenType.ROLE, TokenType.AGENT, TokenType.MINT,
        TokenType.RECEIPT, TokenType.SEAL, TokenType.WALRUS,
        TokenType.FILESYSTEM, TokenType.POLICY, TokenType.PLAN,
        TokenType.ANALYTICS, TokenType.WITNESS, TokenType.PILOT,
        TokenType.VIEWPORT, TokenType.GESTALT, TokenType.EDIT,
        TokenType.BRIDGE, TokenType.SESSION, TokenType.COORDINATE,
        TokenType.THINK, TokenType.BIRTH, TokenType.CHAIN,
        TokenType.STAKE, TokenType.SLASH, TokenType.CONVERT,
        TokenType.ROYALTY, TokenType.ESCROW, TokenType.COMMONS,
        TokenType.PUBLIC_FACING, TokenType.WEB_INGEST, TokenType.SOVEREIGN,
        TokenType.SKILL, TokenType.APP, TokenType.EVOLVE, TokenType.OBSERVE,
        TokenType.HEARTBEAT, TokenType.PERMISSION, TokenType.MCP, TokenType.BUDGET,
        TokenType.REMEMBER, TokenType.SHARE, TokenType.ENUM, TokenType.STRUCT,
        TokenType.FN, TokenType.ASYNC, TokenType.MATCH, TokenType.CASE, TokenType.DEFAULT,
        TokenType.IF, TokenType.ELSE, TokenType.FOR, TokenType.WHILE, TokenType.LOOP,
        TokenType.IN, TokenType.BREAK, TokenType.CONTINUE, TokenType.MUT, TokenType.LET,
        TokenType.CONST
      ];
      if (type === TokenType.IDENTIFIER && allowed.includes(current.type)) {
        this.advance();
        return current;
      }
      throw new Error(
        `Expected ${type}, got ${current.type} at ${current.line}:${current.column}`
      );
    }
    this.advance();
    return current;
  }

  match(...types) {
    if (types.includes(this.current().type)) {
      const token = this.current();
      this.advance();
      return token;
    }
    return null;
  }

  parse() {
    const statements = [];
    while (this.current().type !== TokenType.EOF) {
      try {
        const stmt = this.parseStatement();
        if (stmt !== null) statements.push(stmt);
      } catch (error) {
        this.errors.push(error.message);
        this.recoverFromError();
      }
    }
    return new ASTNode('Program', { statements });
  }

  // Phase 5: Import statement parsing
  parseImportStatement() {
    this.advance(); // consume 'import'
    
    // Parse: import <name> from <source>
    const name = this.expect(TokenType.IDENTIFIER);
    
    // Check for 'from' keyword
    let source = null;
    if (this.current().value === 'from') {
      this.advance(); // consume 'from'
      const sourceToken = this.expect(TokenType.STRING);
      source = sourceToken.value;
    }
    
    return new ASTNode('ImportStatement', {
      name: name.value,
      source
    });
  }

  parseStatement() {
    const token = this.current();

    // Phase 5: Import statement support
    if (token.type === TokenType.IMPORT) {
      return this.parseImportStatement();
    }

    // Phase 5: Handle deprecated primitives (now treated as identifiers)
    if (token.type === TokenType.IDENTIFIER && isDeprecated(token.value)) {
      const primitive = token.value;
      emitDeprecationWarning(primitive, token);
      
      // Advance past the deprecated identifier
      this.advance();
      
      // Route to appropriate parser based on primitive
      switch (primitive) {
        case 'skill': return this.parseSkillDecl();
        case 'team': return this.parseTeamStatement();
        case 'swarm': return this.parseSwarmStatement();
        case 'coordinate': return this.parseCoordinateStatement();
        case 'gestalt': return this.parseGestaltStatement();
        case 'wallet': return this.parseWalletStatement();
        case 'witness': return this.parseWitnessStatement();
        case 'secure': return this.parseSecureBlock();
        case 'chain': return this.parseChainStatement();
        case 'plan': return this.parsePlanStatement();
        case 'retrieve': return this.parseRetrieveStatement();
        case 'mint': 
          this.advance();
          let mintArgs = null;
          if (this.current().type !== TokenType.SEMICOLON && this.current().type !== TokenType.RBRACE) {
            mintArgs = this.parseExpression();
          }
          this.match(TokenType.SEMICOLON);
          return new ASTNode('MintStatement', { config: mintArgs });
        case 'seal':
          this.advance();
          this.match(TokenType.SEMICOLON);
          return new ASTNode('SealStatement', {});
        case 'walrus': return this.parseWalrusStatement();
        case 'sovereign': return this.parseSovereignStatement();
        case 'budget': return this.parseBudgetStatement();
        case 'remember': return this.parseRememberStatement();
        case 'observe': return this.parseObserveStatement();
        case 'evolve': return this.parseEvolveStatement();
        case 'commons': return this.parseCommonsStatement();
        case 'public_facing': return this.parsePublicFacingStatement();
        case 'web_ingest': return this.parseWebIngestStatement();
        case 'heartbeat': return this.parseHeartbeatStatement();
        case 'share': return this.parseShareStatement();
        case 'neural':
          this.advance();
          this.match(TokenType.SEMICOLON);
          return new ASTNode('NeuralLayer', {});
        case 'app': return this.parseAppDecl();
        case 'meta-digital': return this.parseMetaDigital();
        default:
          // Unknown deprecated primitive - treat as expression
          return this.parseExpression();
      }
    }

    // Function declaration
    if (token.type === TokenType.FN) {
      return this.parseFunctionDecl();
    }

    if (token.type === TokenType.ASYNC) {
      this.advance();
      const fn = this.parseFunctionDecl();
      fn.isAsync = true;
      return fn;
    }

    if (token.type === TokenType.AGENT) {
      return this.parseAgentDecl();
    }

    // Struct declaration
    if (token.type === TokenType.STRUCT) {
      return this.parseStructDecl();
    }

    // Enum declaration
    if (token.type === TokenType.ENUM) {
      return this.parseEnumDecl();
    }

    // If statement
    if (token.type === TokenType.IF) {
      return this.parseIfStatement();
    }

    // Match statement
    if (token.type === TokenType.MATCH) {
      return this.parseMatchStatement();
    }

    // Swarm statement
    if (token.type === TokenType.SWARM) {
      // Check for swarm.scale
      if (this.peek().type === TokenType.DOT && 
          this.peek(2).type === TokenType.IDENTIFIER && 
          this.peek(2).value === 'scale') {
        return this.parseSwarmScaleStatement();
      }
      return this.parseSwarmStatement();
    }

    // Birth statement (CORE PRIMITIVE - keep)
    if (token.type === TokenType.BIRTH) {
      return this.parseBirthStatement();
    }

    // Loop until goal
    if (token.type === TokenType.LOOP) {
      return this.parseLoopUntil();
    }

    if (token.type === TokenType.FOR) {
      return this.parseForStatement();
    }

    if (token.type === TokenType.WHILE) {
      return this.parseWhileStatement();
    }

    // Target directive (@target)
    if (token.type === TokenType.AT_TARGET) {
      this.advance();
      let body = null;
      if (this.current().type === TokenType.LBRACE) {
        body = this.parseBlock();
      }
      return new ASTNode('TargetDirective', { target: token.value, body });
    }

    if (token.type === TokenType.RECEIPT) {
      this.advance();
      let args = null;
      if (this.current().type !== TokenType.SEMICOLON && this.current().type !== TokenType.RBRACE) {
        args = this.parseExpression();
      }
      this.match(TokenType.SEMICOLON);
      return new ASTNode('ReceiptStatement', { config: args });
    }

    if (token.type === TokenType.ETHICS) {
      return this.parseEthicsStatement();
    }

    // Permission statement (CORE PRIMITIVE - keep)
    if (token.type === TokenType.PERMISSION) {
      return this.parsePermissionStatement();
    }

    // Filesystem statement (DEPRECATED in v4.0)
    if (token.type === TokenType.FILESYSTEM) {
      emitDeprecationWarning('filesystem', token);
      return this.parseFilesystemBlock();
    }

    // MCP statement (DEPRECATED in v4.0)
    if (token.type === TokenType.MCP) {
      emitDeprecationWarning('mcp', token);
      return this.parseMCPStatement();
    }

    // Team statement (DEPRECATED in v4.0)
    if (token.type === TokenType.TEAM) {
      emitDeprecationWarning('team', token);
      return this.parseTeamStatement();
    }

    // Edit statement (DEPRECATED in v4.0)
    if (token.type === TokenType.EDIT) {
      emitDeprecationWarning('edit', token);
      return this.parseEditStatement();
    }

    // Bridge statement (DEPRECATED in v4.0)
    if (token.type === TokenType.BRIDGE) {
      emitDeprecationWarning('bridge', token);
      return this.parseBridgeStatement();
    }

    // Session statement (DEPRECATED in v4.0)
    if (token.type === TokenType.SESSION) {
      emitDeprecationWarning('session', token);
      return this.parseSessionStatement();
    }

    // Policy statement (DEPRECATED in v4.0)
    if (token.type === TokenType.POLICY) {
      emitDeprecationWarning('policy', token);
      return this.parsePolicyStatement();
    }

    // Analytics statement (DEPRECATED in v4.0)
    if (token.type === TokenType.ANALYTICS) {
      emitDeprecationWarning('analytics', token);
      return this.parseAnalyticsStatement();
    }

    // Coordinate statement (DEPRECATED in v4.0)
    if (token.type === TokenType.COORDINATE) {
      emitDeprecationWarning('coordinate', token);
      return this.parseCoordinateStatement();
    }

    // Witness statement (multimodal perception) (DEPRECATED in v4.0)
    if (token.type === TokenType.WITNESS) {
      emitDeprecationWarning('witness', token);
      return this.parseWitnessStatement();
    }

    // Pilot statement (computer control) (DEPRECATED in v4.0)
    if (token.type === TokenType.PILOT) {
      emitDeprecationWarning('pilot', token);
      return this.parsePilotStatement();
    }

    // Viewport statement (screen understanding) (DEPRECATED in v4.0)
    if (token.type === TokenType.VIEWPORT) {
      emitDeprecationWarning('viewport', token);
      return this.parseViewportStatement();
    }

    // Gestalt statement (parallel tool execution) (DEPRECATED in v4.0)
    if (token.type === TokenType.GESTALT) {
      emitDeprecationWarning('gestalt', token);
      return this.parseGestaltStatement();
    }

    // Phase 7: ToC Tokenomics (DEPRECATED in v4.0)
    if (token.type === TokenType.TOKEN) {
      emitDeprecationWarning('token', token);
      return this.parseTokenStatement();
    }
    if (token.type === TokenType.WALLET) {
      emitDeprecationWarning('wallet', token);
      return this.parseWalletStatement();
    }
    if (token.type === TokenType.STAKE) {
      emitDeprecationWarning('stake', token);
      return this.parseStakeStatement();
    }
    if (token.type === TokenType.SLASH) {
      emitDeprecationWarning('slash', token);
      return this.parseSlashStatement();
    }
    if (token.type === TokenType.CONVERT) {
      emitDeprecationWarning('convert', token);
      return this.parseConvertStatement();
    }
    if (token.type === TokenType.ROYALTY) {
      emitDeprecationWarning('royalty', token);
      return this.parseRoyaltyStatement();
    }
    if (token.type === TokenType.ESCROW) {
      emitDeprecationWarning('escrow', token);
      return this.parseEscrowStatement();
    }

    // Call tool statement (DEPRECATED in v4.0)
    if (token.type === TokenType.CALL_TOOL) {
      emitDeprecationWarning('call_tool', token);
      return this.parseCallToolStatement();
    }

    // Think statement (keyword syntax: think "prompt" { config })
    // Falls through to expression parser if followed by ( for backward compat
    if (token.type === TokenType.THINK && this.peek().type !== TokenType.LPAREN) {
      this.advance();
      return this.parseThinkStatement();
    }

    // Return statement
    if (token.type === TokenType.RETURN) {
      this.advance();
      const value = this.parseExpression();
      this.match(TokenType.SEMICOLON);
      return new ASTNode('Return', { value });
    }

    // Break statement
    if (token.type === TokenType.BREAK) {
      this.advance();
      this.match(TokenType.SEMICOLON);
      return new ASTNode('Break', {});
    }

    // Variable declaration
    if (token.type === TokenType.LET || token.type === TokenType.CONST || token.type === TokenType.MUT) {
      return this.parseVariableDecl();
    }

    // Top-level assignment (implicit let)
    if (token.type === TokenType.IDENTIFIER && this.peek().type === TokenType.ASSIGN) {
      const name = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.ASSIGN);
      const value = this.parseExpression();
      this.match(TokenType.SEMICOLON);
      return new ASTNode('VariableDecl', { name, value, isMut: true });
    }

    // Expression statement
    const expr = this.parseExpression();
    
    // If it's one of our special keyword "statements" that can also be expressions
    const exprWithBraces = ['CommonsStatement', 'PublicFacingStatement', 'WebIngestStatement'];
    if (exprWithBraces.includes(expr.type)) {
      this.match(TokenType.SEMICOLON);
      return expr;
    }

    this.match(TokenType.SEMICOLON);
    return expr;
  }

  parseFunctionDecl() {
    this.expect(TokenType.FN);
    const name = this.expect(TokenType.IDENTIFIER).value;

    // Type parameters (generics)
    let typeParams = [];
    if (this.current().type === TokenType.LT) {
      this.advance();
      typeParams = this.parseTypeParamList();
      this.expect(TokenType.GT);
    }

    // Parameters
    this.expect(TokenType.LPAREN);
    const params = this.parseParamList();
    this.expect(TokenType.RPAREN);

    // Return type
    let returnType = null;
    if (this.current().type === TokenType.ARROW) {
      this.advance();
      returnType = this.parseType();
    }

    // Body
    const body = this.parseBlock(true);

    return new ASTNode('FunctionDecl', {
      name,
      params,
      returnType,
      body,
      typeParams,
    });
  }

  parseThinkStatement() {
    const prompt = this.parseExpression();
    const config = {};
    if (this.current().type === TokenType.LBRACE) {
      this.advance(); // consume {
      while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
        // Config keys can be keywords (loop, budget, plan, etc.) or identifiers
        const keyToken = this.current();
        const key = keyToken.value;
        this.advance();
        this.expect(TokenType.COLON);
        const val = this.parseExpression();
        config[key] = val;
        if (this.current().type === TokenType.COMMA) this.advance();
        if (this.current().type === TokenType.SEMICOLON) this.advance();
      }
      this.expect(TokenType.RBRACE);
    }
    this.match(TokenType.SEMICOLON);
    return new ASTNode('ThinkStatement', { prompt, config });
  }

  parseBudgetStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.consumeSeparators();
      if (this.current().type === TokenType.RBRACE) break;

      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('BudgetStatement', { config });
  }

  parseRememberStatement() {
    const config = {};
    const items = [];
    if (this.current().type === TokenType.LBRACE) {
      this.advance();
      while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
        this.consumeSeparators();
        if (this.current().type === TokenType.RBRACE) break;

        if (this.peek().type === TokenType.COLON) {
          const key = this.expect(TokenType.IDENTIFIER).value;
          this.expect(TokenType.COLON);
          config[key] = this.parseExpression();
        } else {
          items.push(this.parseExpression());
        }
      }
      this.expect(TokenType.RBRACE);
    } else {
      // Shorthand syntax: remember key
      const key = this.parseExpression();
      return new ASTNode('RememberStatement', { key });
    }
    return new ASTNode('RememberStatement', { items, config });
  }

  parseObserveStatement() {
    this.expect(TokenType.LBRACE);
    const event = this.parseExpression();
    this.expect(TokenType.RBRACE);
    return {
      type: 'ObserveStatement',
      event
    };
  }

  parseEvolveStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.consumeSeparators();
      if (this.current().type === TokenType.RBRACE) break;

      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('EvolveStatement', { config });
  }

  parseEthicsStatement() {
    this.expect(TokenType.ETHICS);
    this.expect(TokenType.LBRACE);
    const rules = [];
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.consumeSeparators();
      if (this.current().type === TokenType.RBRACE) break;

      // Parse rule name, which may include dashes
      let rule = this.expect(TokenType.IDENTIFIER).value;
      while (this.current().type === TokenType.MINUS) {
        this.advance();
        // Next can be IDENTIFIER or keyword like NONE
        const next = this.current();
        if (next.type === TokenType.IDENTIFIER || next.type === TokenType.NONE || next.type === TokenType.TRUE || next.type === TokenType.FALSE) {
          rule += '-' + next.value;
          this.advance();
        } else {
          throw new Error(`Expected identifier after -, got ${next.type}`);
        }
      }
      let value = true;
      if (this.current().type === TokenType.COLON) {
        this.advance();
        value = this.parseExpression();
      }
      rules.push({ rule, value });
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('EthicsStatement', { rules });
  }

  parseHeartbeatStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.consumeSeparators();
      if (this.current().type === TokenType.RBRACE) break;

      const keyToken = this.expect(TokenType.IDENTIFIER);
      const key = keyToken.value;
      if (this.current().type === TokenType.COLON)
        this.advance();
      let val = this.parseExpression();
      // Support unit suffixes like 30s
      if (val.type === 'Number' && this.current().type === TokenType.IDENTIFIER &&
          ['s', 'ms', 'm'].includes(this.current().value)) {
        const suffix = this.current().value;
        this.advance();
        val = new ASTNode('String', { value: val.value + suffix });
      }
      config[key] = val;
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('HeartbeatStatement', { config });
  }

  parseClosure() {
    this.expect(TokenType.BAR);
    const params = [];
    while (this.current().type !== TokenType.BAR && !this.isAtEnd()) {
      params.push(this.expect(TokenType.IDENTIFIER).value);
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.BAR);
    
    // Body can be a block or an expression
    let body;
    if (this.current().type === TokenType.LBRACE) {
      body = this.parseBlock();
    } else {
      body = this.parseExpression();
    }
    
    return new ASTNode('Closure', { params, body });
  }

  parseParamList() {
    const params = [];
    while (this.current().type !== TokenType.RPAREN) {
      const name = this.expect(TokenType.IDENTIFIER).value;
      let type = null;
      if (this.current().type === TokenType.COLON) {
        this.advance();
        type = this.parseType();
      }
      
      let defaultValue = null;
      if (this.current().type === TokenType.ASSIGN) {
        this.advance();
        defaultValue = this.parseExpression();
      }
      
      params.push({ name, type, defaultValue });

      if (this.current().type !== TokenType.RPAREN) {
        this.expect(TokenType.COMMA);
      }
    }
    return params;
  }

  parseTypeParamList() {
    const params = [];
    while (this.current().type !== TokenType.GT) {
      const name = this.expect(TokenType.IDENTIFIER).value;
      params.push(name);
      if (this.current().type !== TokenType.GT) {
        this.expect(TokenType.COMMA);
      }
    }
    return params;
  }

  parseType() {
    // Handle [type] array syntax
    if (this.current().type === TokenType.LBRACKET) {
      this.advance();
      const innerType = this.parseType();
      this.expect(TokenType.RBRACKET);
      return { array: innerType };
    }

    let type = this.expect(TokenType.IDENTIFIER).value;

    // Generic types (e.g., Option<i32>)
    if (this.current().type === TokenType.LT) {
      this.advance();
      const innerType = this.parseType();
      this.expect(TokenType.GT);
      type = { generic: type, inner: innerType };
    }

    // Array types (e.g., i32[])
    if (this.current().type === TokenType.LBRACKET) {
      this.advance();
      this.expect(TokenType.RBRACKET);
      type = { array: type };
    }

    return type;
  }

  parseStructDecl() {
    this.expect(TokenType.STRUCT);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);

    const fields = [];
    while (this.current().type !== TokenType.RBRACE) {
      const fieldName = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      const fieldType = this.parseType();
      fields.push({ name: fieldName, type: fieldType });

      if (this.current().type !== TokenType.RBRACE) {
        this.expect(TokenType.COMMA);
      }
    }

    this.expect(TokenType.RBRACE);

    return new ASTNode('StructDecl', { name, fields });
  }

  parseEnumDecl() {
    this.expect(TokenType.ENUM);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);

    const variants = [];
    while (this.current().type !== TokenType.RBRACE) {
      variants.push(this.expect(TokenType.IDENTIFIER).value);
      if (this.current().type !== TokenType.RBRACE) {
        this.expect(TokenType.COMMA);
      }
    }

    this.expect(TokenType.RBRACE);

    return new ASTNode('EnumDecl', { name, variants });
  }

  parseIfStatement() {
    this.expect(TokenType.IF);
    const condition = this.parseExpression();
    const thenBranch = this.parseBlock();

    let elseBranch = null;
    if (this.current().type === TokenType.ELSE) {
      this.advance();
      elseBranch = this.parseBlock();
    }

    return new ASTNode('If', { condition, thenBranch, elseBranch });
  }

  parseMatchStatement() {
    this.expect(TokenType.MATCH);
    const expr = this.parseExpression();
    this.expect(TokenType.LBRACE);

    const arms = [];
    while (this.current().type !== TokenType.RBRACE) {
      let pattern;
      if (this.current().type === TokenType.CASE) {
        this.advance();
        pattern = this.parsePattern();
      } else if (this.current().type === TokenType.DEFAULT) {
        this.advance();
        pattern = new ASTNode('IdentifierPattern', { name: '_' });
      } else {
        pattern = this.parsePattern();
      }

      // Support both -> and => for arms
      if (this.current().type === TokenType.ARROW || this.current().type === TokenType.FAT_ARROW) {
        this.advance();
      } else {
        throw new Error(`Expected -> or => after pattern in match arm, got ${this.current().type}`);
      }

      const body = this.parseExpression();
      arms.push({ pattern, body });

      if (this.current().type === TokenType.COMMA) {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);

    return new ASTNode('Match', { expr, arms });
  }

  parseAgentDecl() {
    this.expect(TokenType.AGENT);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let config;
    if (this.current().type === TokenType.ASSIGN) {
      this.advance();
      config = this.parseExpression();
    } else {
      config = this.parseExpression(); // Try parsing block as DictLiteral
    }
    
    this.match(TokenType.SEMICOLON);
    return new ASTNode('AgentDecl', { name, config });
  }

  parseSwarmStatement() {
    
    let swarmName = null;
    if (this.current().type === TokenType.STRING) {
      swarmName = this.advance().value;
    }
    
    this.expect(TokenType.LBRACE);

    const steps = [];
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      // Skip leading separators or empty lines
      while (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) {
        this.advance();
      }
      if (this.current().type === TokenType.RBRACE) break;

      // Handle behavior statements inside swarm (chain, evolve, heartbeat, etc.)
      const token = this.current();
      if ([TokenType.CHAIN, TokenType.EVOLVE, TokenType.HEARTBEAT, TokenType.REMEMBER, TokenType.THINK].includes(token.type)) {
        const stmt = this.parseStatement();
        steps.push({ type: 'Behavior', stmt });
        continue;
      }

      let target = null;

      // Handle @target shorthand before agent name
      if (this.current().type === TokenType.AT_TARGET) {
        target = this.advance().value;
      }

      let name;
      let role;

      // Check for shorthand: think "worker" (standalone)
      if (this.current().type === TokenType.THINK && this.peek().type === TokenType.STRING) {
        name = 'AnonymousThinker';
        this.advance();
        role = this.parseThinkStatement();
      } else {
        name = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.COLON);
        
        if (this.current().type === TokenType.THINK) {
          this.advance();
          role = this.parseThinkStatement();
        } else if (this.current().type === TokenType.IDENTIFIER && this.current().value === 'Agent') {
          this.advance();
          this.expect(TokenType.LBRACE);
          const fields = {};
          while (this.current().type !== TokenType.RBRACE) {
            const fieldName = this.expect(TokenType.IDENTIFIER).value;
            this.expect(TokenType.COLON);
            fields[fieldName] = this.parseExpression();
            if (this.current().type === TokenType.COMMA) this.advance();
          }
          this.expect(TokenType.RBRACE);
          role = new ASTNode('AgentDefinition', { fields });
        } else {
          role = this.parsePipeline();
        }
      }
      
      // Support trailing @target
      const targetToken = this.match(TokenType.AT_TARGET);
      if (targetToken) {
        target = targetToken.value;
      }

      steps.push({ name, role, target });

      // Consume separator after step
      if (this.current().type === TokenType.FAT_ARROW || 
          this.current().type === TokenType.COMMA ||
          this.current().type === TokenType.SEMICOLON) {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('SwarmStatement', { name: swarmName, steps });
  }

  parseSwarmScaleStatement() {
    this.expect(TokenType.SWARM);
    this.expect(TokenType.DOT);
    this.expect(TokenType.IDENTIFIER); // 'scale'
    this.expect(TokenType.LBRACE);

    const config = {};
    while (this.current().type !== TokenType.RBRACE) {
      const fieldName = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      config[fieldName] = this.parseExpression();

      if (this.current().type === TokenType.COMMA) {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('SwarmScaleStatement', { config: new ASTNode('DictLiteral', { fields: config }) });
  }

  parseShareStatement() {
    this.expect(TokenType.LBRACE);

    const config = {};
    while (this.current().type !== TokenType.RBRACE) {
      const fieldName = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      config[fieldName] = this.parseExpression();

      if (this.current().type === TokenType.COMMA) {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('ShareStatement', { config: new ASTNode('DictLiteral', { fields: config }) });
  }

  parseBirthStatement() {
    this.expect(TokenType.BIRTH);
    this.expect(TokenType.LBRACE);

    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.consumeSeparators();
      if (this.current().type === TokenType.RBRACE) break;

      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('BirthStatement', { config: new ASTNode('DictLiteral', { fields: config }) });
  }

  parseAppDecl() {
    this.expect(TokenType.LBRACE);

    const config = {};
    while (this.current().type !== TokenType.RBRACE) {
      const fieldName = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      config[fieldName] = this.parseExpression();

      if (this.current().type === TokenType.COMMA) {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('AppDecl', { config });
  }

  parseMetaDigital() {
    const name = this.expect(TokenType.STRING).value;
    this.expect(TokenType.LBRACE);

    const config = {};
    while (this.current().type !== TokenType.RBRACE) {
      const fieldName = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      
      let value;
      if (fieldName === 'chain') {
        value = [];
        while (true) {
          if (this.current().type === TokenType.IDENTIFIER || this.current().type === TokenType.BIRTH) {
            value.push(this.current().value);
            this.advance();
          } else {
            throw new Error(`Expected chain identifier, got ${this.current().type}`);
          }
          if (this.current().type === TokenType.COMMA) {
            this.advance();
          } else {
            break;
          }
        }
      } else {
        value = this.parseExpression();
      }

      config[fieldName] = value;
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
      } else if (this.current().type === TokenType.COMMA) {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('MetaDigital', { name, config });
  }

  parseSkillDecl() {
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);

    const body = [];
    while (this.current().type !== TokenType.RBRACE) {
      if (this.current().type === TokenType.CALL_TOOL) {
        body.push(this.parseCallToolStatement());
      } else if (this.current().type === TokenType.LOOP) {
        body.push(this.parseLoopUntil());
      } else if (this.current().type === TokenType.SECURE) {
        body.push(this.parseSecureBlock());
      } else {
        const field = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.COLON);
        const value = this.parseExpression();
        body.push(new ASTNode('SkillProperty', { name: field, value }));
      }
      if (this.current().type === TokenType.COMMA) this.advance();
    }

    this.expect(TokenType.RBRACE);
    return new ASTNode('SkillDecl', { name, body });
  }

  parseSecureBlock() {
    this.expect(TokenType.LBRACE);
    const policies = {};
    const body = [];
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      // Parse policy key-value pairs (execution, network, filesystem, memory, receipts, audit)
      if (this.peek().type === TokenType.COLON) {
        const keyToken = this.expect(TokenType.IDENTIFIER);
        const key = keyToken.value;
        this.expect(TokenType.COLON);
        const value = this.parseExpression();
        const val = typeof value === 'object' && value.value !== undefined ? value.value : value;
        policies[key] = val;
      } else {
        // Parse nested statements inside secure block
        body.push(this.parseStatement());
      }
      if (this.current().type === TokenType.SEMICOLON) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('SecureBlock', { policies, body });
  }

  parseLoopUntil() {
    this.expect(TokenType.LOOP);
    
    // Support "loop until goal: string"
    if (this.current().type === TokenType.UNTIL) {
      this.advance();
      if (this.current().type === TokenType.GOAL) {
        this.advance();
        this.expect(TokenType.COLON);
      }
    }
    
    const untilStr = this.expect(TokenType.STRING).value;
    const body = this.parseBlock();
    return new ASTNode('LoopStatement', { until: untilStr, body });
  }

  parseForStatement() {
    this.expect(TokenType.FOR);
    const item = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.IN);
    const iterable = this.parseExpression();
    const body = this.parseBlock();
    return new ASTNode('ForStatement', { item, iterable, body });
  }

  parseWhileStatement() {
    this.expect(TokenType.WHILE);
    const condition = this.parseExpression();
    const body = this.parseBlock();
    return new ASTNode('WhileStatement', { condition, body });
  }

  parseChainStatement() {
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.advance().value;
    }
    this.expect(TokenType.LBRACE);
    const steps = [];
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.consumeSeparators();
      if (this.current().type === TokenType.RBRACE) break;

      const step = this.parseChainStep();
      steps.push(step);
      
      // Support optional arrow ->
      if (this.current().type === TokenType.ARROW) {
        this.advance();
      }
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('ChainStatement', { name, steps });
  }

  parseChainStep() {
    const token = this.current();
    if (token.type === TokenType.THINK) {
      this.advance();
      const prompt = this.parseExpression();
      return new ASTNode('ThinkStatement', { prompt });
    } else if (token.type === TokenType.IDENTIFIER && token.value === 'invoke') {
      this.advance();
      const tool = this.parseExpression();
      return new ASTNode('InvokeStatement', { tool });
    } else if (token.type === TokenType.IDENTIFIER && token.value === 'retrieve') {
      this.advance();
      const vault = this.parseExpression();
      return new ASTNode('RetrieveStatement', { vault });
    } else if (token.type === TokenType.RECEIPT) {
      this.advance();
      return new ASTNode('ReceiptStatement', {});
    }
    throw new Error(`Unexpected step in chain: ${token.type}`);
  }

  parsePlanStatement() {
    let goal = null;
    if (this.current().type === TokenType.STRING) {
      goal = this.expect(TokenType.STRING).value;
    }
    const body = this.parseBlock();
    return new ASTNode('PlanStatement', { goal, body });
  }

  parseRetrieveStatement() {
    const source = this.check(TokenType.STRING) ? this.advance().value : 'vault';
    let query = null;
    if (this.check(TokenType.LBRACE)) {
      this.advance();
      if (this.check(TokenType.IDENTIFIER) && this.peek().value === 'embed') {
        this.advance();
        query = this.parseExpression();
      }
      this.expect(TokenType.RBRACE);
    }
    return new ASTNode('RetrieveStatement', { source, query });
  }

  parseCallToolStatement() {
    this.expect(TokenType.CALL_TOOL);
    const name = this.expect(TokenType.STRING).value;
    const args = this.parseExpression(); // Expecting a DictLiteral or other expression
    return new ASTNode('CallToolStatement', { name, args });
  }

  parsePermissionStatement() {
    this.expect(TokenType.PERMISSION);
    this.expect(TokenType.LBRACE);
    const rules = [];
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      // Action names may be keywords (think, chain, birth, mint, seal, etc.)
      const actionToken = this.current();
      let action;
      if (actionToken.type === TokenType.IDENTIFIER || actionToken.value) {
        action = actionToken.value;
        this.advance();
      } else {
        throw new Error(`Expected action name in permission block at ${actionToken.line}:${actionToken.column}`);
      }
      // Handle underscored names: file_write, file_edit, call_tool
      while (this.current().type === TokenType.IDENTIFIER && this.previous()?.value === '_') {
        action += this.current().value;
        this.advance();
      }
      this.expect(TokenType.COLON);
      const value = this.parseExpression();
      rules.push({ action, value });
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('PermissionStatement', { rules });
  }

  parseFilesystemBlock() {
    this.expect(TokenType.FILESYSTEM);
    this.expect(TokenType.LBRACE);
    const policies = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const keyToken = this.expect(TokenType.IDENTIFIER);
      const key = keyToken.value;
      this.expect(TokenType.COLON);
      const value = this.parseExpression();
      policies[key] = value;
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('FilesystemBlock', { policies });
  }

  parseMCPStatement() {
    this.expect(TokenType.MCP);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('MCPStatement', { config });
  }

  parseTeamStatement() {
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.expect(TokenType.STRING).value;
    }
    this.expect(TokenType.LBRACE);
    const roles = {};
    let coordination = 'hierarchical';
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON || this.current().type === TokenType.COMMA) {
        this.advance();
        continue;
      }
      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      if (key === 'coordination') {
        coordination = this.parseExpression();
      } else {
        // Role definition
        roles[key] = this.parseExpression();
      }
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('TeamStatement', { name, roles, coordination });
  }

  parseEditStatement() {
    this.expect(TokenType.EDIT);
    const filePath = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('EditStatement', { file: filePath, config });
  }

  parseBridgeStatement() {
    this.expect(TokenType.BRIDGE);
    // Optional name: bridge "MyBridge" { ... }
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      // Accept keywords as keys (transport, port, session, etc.)
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('BridgeStatement', { name, config });
  }

  parseSessionStatement() {
    this.expect(TokenType.SESSION);
    // session "name" { ... } or session { action: "resume", id: "..." }
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    } else if (this.current().type === TokenType.IDENTIFIER) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('SessionStatement', { name, config });
  }

  parsePolicyStatement() {
    this.expect(TokenType.POLICY);
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('PolicyStatement', { name, config });
  }

  parseAnalyticsStatement() {
    this.expect(TokenType.ANALYTICS);
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    } else if (this.current().type === TokenType.IDENTIFIER) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('AnalyticsStatement', { name, config });
  }

  parseCoordinateStatement() {
    // coordinate "task description" { strategy: "democratic" }
    let task = null;
    if (this.current().type === TokenType.STRING) {
      task = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('CoordinateStatement', { task, config });
  }

  parseWitnessStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('WitnessStatement', { config });
  }

  parsePilotStatement() {
    this.expect(TokenType.PILOT);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('PilotStatement', { config });
  }

  parseViewportStatement() {
    this.expect(TokenType.VIEWPORT);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('ViewportStatement', { config });
  }

  parseGestaltStatement() {
    this.expect(TokenType.LBRACE);
    const concurrent = [];
    let merge = 'unified_context';
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) {
        this.advance();
        continue;
      }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      if (key === 'merge') {
        merge = this.parseExpression();
      } else {
        const val = this.parseExpression();
        concurrent.push({ action: key, value: val });
      }
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('GestaltStatement', { concurrent, merge });
  }

  // Phase 7: ToC Tokenomics parse methods

  parseTokenStatement() {
    this.expect(TokenType.TOKEN);
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('TokenStatement', { name, config });
  }

  parseWalletStatement() {
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('WalletStatement', { name, config });
  }

  parseStakeStatement() {
    this.expect(TokenType.STAKE);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('StakeStatement', { config });
  }

  parseSlashStatement() {
    this.expect(TokenType.SLASH);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('SlashStatement', { config });
  }

  parseConvertStatement() {
    this.expect(TokenType.CONVERT);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('ConvertStatement', { config });
  }

  parseRoyaltyStatement() {
    this.expect(TokenType.ROYALTY);
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('RoyaltyStatement', { config });
  }

  parseEscrowStatement() {
    this.expect(TokenType.ESCROW);
    let name = null;
    if (this.current().type === TokenType.STRING) {
      name = this.current().value;
      this.advance();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      if (this.current().type === TokenType.SEMICOLON) { this.advance(); continue; }
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      config[key] = this.parseExpression();
      if (this.current().type === TokenType.SEMICOLON) this.advance();
      if (this.current().type === TokenType.COMMA) this.advance();
    }
    this.expect(TokenType.RBRACE);
    return new ASTNode('EscrowStatement', { name, config });
  }

  parsePattern() {
    if (this.current().type === TokenType.IDENTIFIER) {
      const name = this.expect(TokenType.IDENTIFIER).value;

      // Some(x) pattern
      if (this.current().type === TokenType.LPAREN) {
        this.advance();
        const inner = this.parsePattern();
        this.expect(TokenType.RPAREN);
        return new ASTNode('ConstructorPattern', {
          constructor: name,
          args: [inner],
        });
      }

      return new ASTNode('IdentifierPattern', { name });
    }

    if (this.current().type === TokenType.STRING) {
      return new ASTNode('String', { value: this.advance().value });
    }

    if (this.current().type === TokenType.NUMBER) {
      return new ASTNode('Number', { value: this.advance().value });
    }

    throw new Error(`Unexpected pattern: ${this.current().type}`);
  }

  parseVariableDecl() {
    let isConst = false;
    let isMut = false;

    if (this.current().type === TokenType.CONST) {
      isConst = true;
      this.advance();
    } else if (this.current().type === TokenType.MUT) {
      isMut = true;
      this.advance();
    } else if (this.current().type === TokenType.LET) {
      this.advance();
      if (this.current().type === TokenType.MUT) {
        isMut = true;
        this.advance();
      }
    }

    const name = this.expect(TokenType.IDENTIFIER).value;

    let type = null;
    if (this.current().type === TokenType.COLON) {
      this.advance();
      type = this.parseType();
    }

    this.expect(TokenType.ASSIGN);
    const value = this.parseExpression();
    this.match(TokenType.SEMICOLON);

    return new ASTNode('VariableDecl', { name, type, value, isMut, isConst });
  }

  parseBlock(isFunctionBody = false) {
    this.expect(TokenType.LBRACE);
    const statements = [];

    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt !== null) statements.push(stmt);
      } catch (error) {
        this.errors.push(error.message);
        this.recoverFromError();
        if (this.current().type === TokenType.RBRACE || this.isAtEnd()) break;
      }
    }

    this.expect(TokenType.RBRACE);

    // If this is a function body and the last statement is an expression, wrap it in Return
    if (isFunctionBody && statements.length > 0) {
      const last = statements[statements.length - 1];
      const expressionTypes = ['BinaryOp', 'Number', 'String', 'Boolean', 'Nil', 'Identifier', 'FunctionCall', 'Call', 'MethodCall', 'FieldAccess', 'ArrayLiteral', 'DictLiteral', 'Index'];
      if (expressionTypes.includes(last.type)) {
        // Don't wrap print calls in return
        if (!(last.type === 'FunctionCall' && last.name === 'print')) {
          statements[statements.length - 1] = new ASTNode('Return', { value: last });
        }
      }
    }

    return new ASTNode('Block', { statements });
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    let left = this.parseArrowFunction();

    if (this.current().type === TokenType.ASSIGN) {
      this.advance();
      const right = this.parseAssignment();

      if (left.type === 'Identifier' || left.type === 'FieldAccess' || left.type === 'Index') {
        return new ASTNode('Assignment', { left, right });
      } else {
        throw new Error(`Invalid assignment target: ${left.type}`);
      }
    }

    return left;
  }

  parseArrowFunction() {
    // Basic support for param => expr
    // We need lookahead to be sure it's an arrow function
    if (this.current().type === TokenType.IDENTIFIER && this.peek().type === TokenType.FAT_ARROW) {
      const param = this.advance().value;
      this.advance(); // consume =>
      const body = this.parseExpression();
      return new ASTNode('ArrowFunction', { params: [param], body });
    }
    
    // Support (a, b) => expr
    if (this.current().type === TokenType.LPAREN) {
      // This is tricky without backtracking. Let's try a simple version.
      // If we see ( id, or ( id ) =>
    }

    return this.parsePipeline();
  }

  parsePipeline() {
    let left = this.parseLogicalOr();

    while (this.current().type === TokenType.PIPE) {
      this.advance();
      const right = this.parseLogicalOr();
      left = new ASTNode('Pipeline', { left, right });
    }

    return left;
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();

    while (this.current().type === TokenType.OR) {
      this.advance();
      const right = this.parseLogicalAnd();
      left = new ASTNode('BinaryOp', { op: '||', left, right });
    }

    return left;
  }

  parseLogicalAnd() {
    let left = this.parseEquality();

    while (this.current().type === TokenType.AND) {
      this.advance();
      const right = this.parseEquality();
      left = new ASTNode('BinaryOp', { op: '&&', left, right });
    }

    return left;
  }

  parseEquality() {
    let left = this.parseRelational();

    while (this.current().type === TokenType.EQ || this.current().type === TokenType.NE) {
      const op = this.current().value;
      this.advance();
      const right = this.parseRelational();
      left = new ASTNode('BinaryOp', { op, left, right });
    }

    return left;
  }

  parseRelational() {
    let left = this.parseAdditive();

    while (
      this.current().type === TokenType.LT ||
      this.current().type === TokenType.LE ||
      this.current().type === TokenType.GT ||
      this.current().type === TokenType.GE
    ) {
      const op = this.current().value;
      this.advance();
      const right = this.parseAdditive();
      left = new ASTNode('BinaryOp', { op, left, right });
    }

    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.current().type === TokenType.PLUS || this.current().type === TokenType.MINUS) {
      const op = this.current().value;
      this.advance();
      const right = this.parseMultiplicative();
      left = new ASTNode('BinaryOp', { op, left, right });
    }

    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();

    while (
      this.current().type === TokenType.STAR ||
      this.current().type === TokenType.SLASH ||
      this.current().type === TokenType.PERCENT
    ) {
      const op = this.current().value;
      this.advance();
      const right = this.parseUnary();
      left = new ASTNode('BinaryOp', { op, left, right });
    }

    return left;
  }

  parseUnary() {
    if (this.current().type === TokenType.AWAIT) {
      this.advance();
      const expr = this.parseUnary();
      return new ASTNode('UnaryOp', { op: 'await ', expr });
    }

    if (this.current().type === TokenType.NOT) {
      this.advance();
      const expr = this.parseUnary();
      return new ASTNode('UnaryOp', { op: '!', expr });
    }

    if (this.current().type === TokenType.MINUS) {
      this.advance();
      const expr = this.parseUnary();
      return new ASTNode('UnaryOp', { op: '-', expr });
    }

    if (this.current().type === TokenType.AMPERSAND) {
      this.advance();
      const expr = this.parseUnary();
      return new ASTNode('UnaryOp', { op: '&', expr });
    }

    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();

    while (true) {
      if (this.current().type === TokenType.DOT) {
        this.advance();
        const field = this.expect(TokenType.IDENTIFIER).value;

        if (this.current().type === TokenType.LPAREN) {
          // Method call
          this.advance();
          const args = this.parseArgumentList();
          this.expect(TokenType.RPAREN);
          expr = new ASTNode('MethodCall', { object: expr, method: field, args });
        } else {
          // Field access
          expr = new ASTNode('FieldAccess', { object: expr, field });
        }
      } else if (this.current().type === TokenType.LBRACKET) {
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenType.RBRACKET);
        expr = new ASTNode('Index', { object: expr, index });
      } else if (this.current().type === TokenType.LPAREN) {
        // Call
        this.advance();
        const args = this.parseArgumentList();
        this.expect(TokenType.RPAREN);
        
        if (expr.type === 'Identifier') {
          expr = new ASTNode('FunctionCall', { name: expr.name, args });
        } else {
          expr = new ASTNode('Call', { callee: expr, args });
        }
      } else {
        break;
      }
    }

    return expr;
  }

  parseArgumentList() {
    const args = [];
    while (this.current().type !== TokenType.RPAREN) {
      args.push(this.parseExpression());
      if (this.current().type !== TokenType.RPAREN) {
        this.expect(TokenType.COMMA);
      }
    }
    return args;
  }

  parsePrimary() {
    const token = this.current();

    // Literals
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return new ASTNode('Number', { value: parseFloat(token.value) });
    }

    if (token.type === TokenType.STRING) {
      this.advance();
      return new ASTNode('String', { value: token.value });
    }

    if (token.type === TokenType.TRUE) {
      this.advance();
      return new ASTNode('Boolean', { value: true });
    }

    if (token.type === TokenType.FALSE) {
      this.advance();
      return new ASTNode('Boolean', { value: false });
    }

    if (token.type === TokenType.NIL || token.type === TokenType.NONE) {
      this.advance();
      return new ASTNode('Nil', {});
    }

    // Prompt
    if (token.type === TokenType.PROMPT) {
      this.advance();
      return new ASTNode('Prompt', { text: token.value });
    }

    // Voice
    if (token.type === TokenType.VOICE) {
      this.advance();
      return new ASTNode('Voice', { text: token.value });
    }

    if (token.type === TokenType.COMMONS) {
      return this.parseCommonsStatement();
    }
    if (token.type === TokenType.PUBLIC_FACING) {
      return this.parsePublicFacingStatement();
    }
    if (token.type === TokenType.WEB_INGEST) {
      return this.parseWebIngestStatement();
    }

    // call_tool expression is used both as statement and value expression
    if (token.type === TokenType.CALL_TOOL) {
      return this.parseCallToolStatement();
    }

    // Identifier or AI keywords as identifiers (includes THINK for think(...) call syntax)
    if (token.type === TokenType.IDENTIFIER ||
        token.type === TokenType.PRINTLN ||
        token.type === TokenType.RAG ||
        token.type === TokenType.AI ||
        token.type === TokenType.EMBED ||
        token.type === TokenType.THINK ||
        token.type === TokenType.SEAL ||
        token.type === TokenType.MINT ||
        token.type === TokenType.RECEIPT ||
        token.type === TokenType.WALRUS) {
      this.advance();
      return new ASTNode('Identifier', { name: token.value });
    }

    // Array literal
    if (token.type === TokenType.LBRACKET) {
      this.advance();
      const elements = [];
      while (this.current().type !== TokenType.RBRACKET) {
        elements.push(this.parseExpression());
        if (this.current().type !== TokenType.RBRACKET) {
          this.expect(TokenType.COMMA);
        }
      }
      this.expect(TokenType.RBRACKET);
      return new ASTNode('ArrayLiteral', { elements });
    }

    // Grouped expression or tuple
    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    // Closure |args| body
    if (token.type === TokenType.BAR) {
      return this.parseClosure();
    }

    // Anonymous Dictionary Literal
    if (token.type === TokenType.LBRACE) {
      this.advance();
      const fields = {};
      while (this.current().type !== TokenType.RBRACE) {
        const fieldName = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.COLON);
        fields[fieldName] = this.parseExpression();
        if (this.current().type === TokenType.COMMA) this.advance();
      }
      this.expect(TokenType.RBRACE);
      return new ASTNode('DictLiteral', { fields });
    }

    // Struct literal (named)
    if (token.type === TokenType.IDENTIFIER) {
      const name = token.value;
      if (this.peek().type === TokenType.LBRACE) {
        this.advance();
        this.advance();
        const fields = {};
        while (this.current().type !== TokenType.RBRACE) {
          const fieldName = this.expect(TokenType.IDENTIFIER).value;
          this.expect(TokenType.COLON);
          fields[fieldName] = this.parseExpression();
          if (this.current().type !== TokenType.RBRACE) {
            this.expect(TokenType.COMMA);
          }
        }
        this.expect(TokenType.RBRACE);
        return new ASTNode('StructLiteral', { name, fields });
      }
    }

    if (token.type === TokenType.CALL_TOOL) {
      return this.parseCallToolStatement();
    }

    throw new Error(`Unexpected token: ${token.type} at ${token.line}:${token.column}`);
  }

  parseCommonsStatement() {
    let name = null;
    if (this.current().type !== TokenType.LBRACE) {
      name = this.parseExpression();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
      if (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) this.advance();
    }
    this.expect(TokenType.RBRACE);
    this.match(TokenType.SEMICOLON);
    return new ASTNode('CommonsStatement', { name, config });
  }

  parsePublicFacingStatement() {
    let name = null;
    if (this.current().type !== TokenType.LBRACE) {
      name = this.parseExpression();
    }
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
      if (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) this.advance();
    }
    this.expect(TokenType.RBRACE);
    this.match(TokenType.SEMICOLON);
    return new ASTNode('PublicFacingStatement', { name, config });
  }

  parseWebIngestStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
      if (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) this.advance();
    }
    this.expect(TokenType.RBRACE);
    this.match(TokenType.SEMICOLON);
    return new ASTNode('WebIngestStatement', { config });
  }

  parseSovereignStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
      if (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) this.advance();
    }
    this.expect(TokenType.RBRACE);
    this.match(TokenType.SEMICOLON);
    return new ASTNode('SovereignStatement', { config });
  }

  parseWalrusStatement() {
    this.expect(TokenType.LBRACE);
    const config = {};
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      const key = this.current().value;
      this.advance();
      this.expect(TokenType.COLON);
      const val = this.parseExpression();
      config[key] = val;
      if (this.current().type === TokenType.COMMA || this.current().type === TokenType.SEMICOLON) this.advance();
    }
    this.expect(TokenType.RBRACE);
    this.match(TokenType.SEMICOLON);
    return new ASTNode('WalrusStatement', { config });
  }
}

export { Parser, ASTNode };
