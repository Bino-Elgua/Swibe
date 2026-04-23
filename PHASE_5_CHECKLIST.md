# Phase 5 - Parser Refactoring Checklist

**Status:** Ready to begin  
**Target:** Update parser to handle 5 primitives + stdlib imports  
**Estimated Scope:** 200-300 lines of parser changes  

---

## Overview

The parser currently has ~1500+ lines handling all 33+ deprecated primitives. In Phase 5, we need to:

1. **Add import support** - Allow `import stdlib from "stdlib"`
2. **Clean up statement parsing** - Keep only 5 primitives
3. **Add deprecation warnings** - Alert users about old syntax
4. **Validate stdlib calls** - Ensure proper function signatures

---

## Tasks

### Task 1: Add Import Support ⏳

**File:** `src/parser.js`

**Current State:**
- Parser doesn't handle `import` statements
- Uses global stdlib reference or requires manual setup

**Changes Needed:**
```javascript
// Add import statement parsing
if (token.type === TokenType.IMPORT) {
  return this.parseImportStatement();
}

// New method:
parseImportStatement() {
  this.advance(); // consume 'import'
  const module = this.parseExpression();
  this.match(TokenType.FROM);
  const path = this.match(TokenType.STRING).value;
  return new ASTNode('ImportStatement', { module, path });
}
```

**Test Case:**
```swibe
import stdlib from "stdlib"
```

**Lines Changed:** ~15-20

---

### Task 2: Simplify parseStatement() ⏳

**File:** `src/parser.js`

**Current State:**
- 100+ if-statements for deprecated primitives
- Messy and hard to maintain

**Cleanup:**
```javascript
parseStatement() {
  const token = this.current();

  // Keep: Core language constructs
  if (token.type === TokenType.FN) return this.parseFunctionDecl();
  if (token.type === TokenType.STRUCT) return this.parseStructDecl();
  if (token.type === TokenType.ENUM) return this.parseEnumDecl();
  if (token.type === TokenType.IF) return this.parseIfStatement();
  if (token.type === TokenType.MATCH) return this.parseMatchStatement();
  if (token.type === TokenType.FOR) return this.parseForStatement();
  if (token.type === TokenType.WHILE) return this.parseWhileStatement();
  if (token.type === TokenType.LOOP) return this.parseLoopUntil();

  // Keep: 5 Primitives
  if (token.type === TokenType.BIRTH) return this.parseBirthStatement();
  if (token.type === TokenType.THINK) return this.parseThinkStatement();
  if (token.type === TokenType.ETHICS) return this.parseEthicsStatement();
  if (token.type === TokenType.PERMISSION) return this.parsePermissionStatement();
  if (token.type === TokenType.RECEIPT) return this.parseReceiptStatement();

  // Keep: Import
  if (token.type === TokenType.IMPORT) return this.parseImportStatement();

  // Remove: ~50 if-statements for deprecated primitives
  // These should emit deprecation warnings if encountered
  
  // Otherwise parse as expression
  return this.parseExpressionStatement();
}
```

**Lines Removed:** ~400  
**Lines Added:** ~20  
**Net Change:** -380 lines

---

### Task 3: Add Deprecation Warnings ⏳

**File:** `src/parser.js`

**Create new method:**
```javascript
emitDeprecationWarning(keyword, replacement) {
  console.warn(`⚠️  DEPRECATED: '${keyword}' is deprecated in v4.0`);
  console.warn(`   Use instead: ${replacement}`);
  console.warn(`   See: REFACTORING_SUMMARY.md for migration guide`);
}
```

**Usage in parseStatement:**
```javascript
// Handle deprecated primitives with warnings
if (token.type === TokenType.SKILL) {
  this.emitDeprecationWarning('skill', 'stdlib.hire.registerSkill()');
  // Still parse it for compatibility, but warn
  return this.parseSkillDecl();
}
```

**Lines Added:** ~60

---

### Task 4: Add Stdlib Function Validation ⏳

**File:** `src/parser.js`

**Create validator:**
```javascript
validateStdlibCall(moduleName, functionName, args) {
  const schema = {
    'identity': ['createIdentity', 'registerRole', 'assignRole', 'createNamespace', ...],
    'metabolism': ['createWallet', 'emitDopamine', 'stake', 'unstake', ...],
    // ... etc for all 7 modules
  };
  
  const validFunctions = schema[moduleName];
  if (!validFunctions) {
    throw new Error(`Unknown stdlib module: ${moduleName}`);
  }
  if (!validFunctions.includes(functionName)) {
    throw new Error(`Unknown function in ${moduleName}: ${functionName}`);
  }
}
```

**When to call:**
- During parseExpression() when encountering `stdlib.X.Y()`
- Provides early error detection

**Lines Added:** ~80

---

### Task 5: Handle Think Statement Enhancement ⏳

**File:** `src/parser.js`

**Current parseThinkStatement:**
- Works but could be improved
- Should support nested stdlib calls

**Enhancement:**
```javascript
parseThinkStatement() {
  this.advance(); // consume 'think'
  
  // Parse prompt (natural language)
  const prompt = this.match(TokenType.STRING).value;
  
  // Parse config block
  let config = null;
  if (this.current().type === TokenType.LBRACE) {
    config = this.parseThinkConfig();
  }
  
  return new ASTNode('ThinkStatement', {
    prompt,
    config,
    body: config?.statements || []
  });
}

parseThinkConfig() {
  this.advance(); // consume '{'
  const statements = [];
  
  while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
    // Parse expressions (can be stdlib calls)
    statements.push(this.parseExpression());
    
    if (this.current().type === TokenType.COMMA) {
      this.advance();
    }
  }
  
  this.match(TokenType.RBRACE);
  return { statements };
}
```

**Lines Changed:** ~30

---

### Task 6: Update Type Checker ⏳

**File:** `src/type-inference.js`

**Changes Needed:**
- Add types for stdlib modules
- Infer return types from stdlib calls
- Validate type compatibility

**Example:**
```javascript
case 'StdlibCall': {
  const { module, function: fn } = node;
  
  const returnTypes = {
    'identity.createIdentity': 'Identity',
    'metabolism.getBalance': 'Balance',
    'memory.retrieve': 'any',
    // ... etc
  };
  
  return returnTypes[`${module}.${fn}`] || 'any';
}
```

**Lines Added:** ~60

---

### Task 7: Update Code Generation ⏳

**File:** `src/compiler.js`

**Changes Needed:**
- Generate correct code for stdlib imports
- Handle stdlib function calls in compilation
- Ensure multi-target support

**Example for JavaScript target:**
```javascript
case 'ImportStatement': {
  if (node.path === 'stdlib') {
    return 'import stdlib from "./stdlib/index.js";\n';
  }
  break;
}

case 'StdlibCall': {
  return `stdlib.${node.module}.${node.function}(${this.compileArgs(node.args)})`;
}
```

**Lines Added:** ~40

---

## Implementation Order

1. **Phase 5.1:** Task 1 (Import support) - Foundation
2. **Phase 5.2:** Task 2 (Simplify parseStatement) - Core cleanup
3. **Phase 5.3:** Task 3 (Deprecation warnings) - User communication
4. **Phase 5.4:** Task 4 (Stdlib validation) - Quality assurance
5. **Phase 5.5:** Task 5 (Think enhancement) - UX improvement
6. **Phase 5.6:** Task 6 (Type checker) - Safety
7. **Phase 5.7:** Task 7 (Code generation) - Multi-target support

---

## Testing Plan

**Unit Tests:**
- [ ] Import parsing
- [ ] Stdlib function validation
- [ ] Deprecation warnings
- [ ] Type inference for stdlib

**Integration Tests:**
- [ ] Full program with imports
- [ ] Multi-statement think blocks
- [ ] Deprecation path handling
- [ ] Code generation for all targets

**Examples to Test:**
- [ ] `examples/v4-5-primitives-example.swibe`
- [ ] Migrated old code samples
- [ ] New stdlib compositions

---

## Estimated Effort

| Task | Lines | Complexity | Time |
|------|-------|-----------|------|
| 5.1 - Import | 20 | Easy | 30m |
| 5.2 - Simplify | 420 | Medium | 2h |
| 5.3 - Warnings | 60 | Easy | 1h |
| 5.4 - Validation | 80 | Medium | 1.5h |
| 5.5 - Think | 30 | Easy | 45m |
| 5.6 - Types | 60 | Medium | 1.5h |
| 5.7 - Codegen | 40 | Medium | 1.5h |
| Tests | 200+ | Hard | 3h |
| **TOTAL** | **910+** | **Medium** | **~11h** |

---

## Success Criteria

✅ **Import statements parse correctly**
- `import stdlib from "stdlib"` works
- Module reference available in scope

✅ **Stdlib calls compile**
- `stdlib.identity.createIdentity()` generates correct code
- All 7 modules supported
- All 44 backends work

✅ **Deprecation warnings emitted**
- Old primitives show helpful warnings
- Migration path clear to users

✅ **Backward compatibility maintained** (for now)
- Old code still parses (with warnings)
- Gradual migration possible

✅ **Type safety improved**
- Stdlib function signatures validated
- Return types inferred correctly

✅ **All tests pass**
- New tests added
- Existing tests still work
- Migration examples work

---

## Files to Modify

```
src/
├── parser.js            (main work - simplify & add import support)
├── type-inference.js    (add stdlib type handling)
├── compiler.js          (add stdlib code generation)
├── lexer.js             (already done in Phase 3)
└── index.js             (may need stdlib import setup)

tests/
└── parser.test.js       (add new tests)
```

---

## Next Actions

1. ✅ Phases 1-4 complete (what we did above)
2. ⏳ Review this checklist
3. ⏳ Start Phase 5.1 (Import support)
4. ⏳ Progress through Phase 5.2-7 sequentially
5. ⏳ Test thoroughly before Phase 6

---

**Ready to proceed with Phase 5? Let me know!** 🚀
