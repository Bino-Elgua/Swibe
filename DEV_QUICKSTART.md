# Swibe Language - Developer Quick Start

**Current Status:** Phase 1 - 67% Complete (5/9 features)  
**Last Updated:** December 5, 2025

---

## 🚀 Quick Commands

### Compile Swibe to JavaScript
```bash
cd swibe
node src/index.js compile program.swibe
```

### Run Web Playground
```bash
cd swibe/web-playground
npm install
node server.js
# Open http://localhost:3000
```

### Run Tests
```bash
cd swibe
node src/index.js test tests/
```

### Interactive REPL
```bash
cd swibe
node src/index.js repl
```

---

## 📁 Project Structure

```
swibe/
├── src/
│   ├── index.js              # CLI entry point
│   ├── lexer.js              # Tokenizer (442 lines)
│   ├── parser.js             # Parser (584 lines)
│   ├── compiler.js           # Code generator (344 lines)
│   ├── stdlib.js             # Built-in functions (450 lines)
│   ├── llm-integration.js    # AI integration (240 lines)
│   ├── testing.js            # Test framework (370 lines)
│   ├── repl.js               # Interactive shell
│   └── roadmap-cli.js        # Roadmap tracking
├── vscode-extension/         # VSCode plugin
│   ├── extension.ts
│   ├── language-configuration.json
│   ├── syntaxes/swibe.tmLanguage.json
│   ├── snippets/swibe.json
│   └── themes/
├── web-playground/           # Browser IDE
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── server.js
│   └── package.json
├── examples/                 # Example programs
├── ACTUAL_ROADMAP.md         # Real progress tracking
└── PHASE1_BUILD_COMPLETE.md  # Current status
```

---

## 🔧 What's Built (Phase 1)

### ✅ Core Language (Complete)
- Lexer with 40+ keywords
- Recursive descent parser
- Multi-target compiler (18 languages)
- Standard library (65+ functions)

### ✅ Developer Tools (Complete)
- **VSCode Extension** - Full syntax support, completion, themes
- **Web Playground** - Browser-based IDE with multi-target compilation
- **Testing Framework** - #[test] macros, 13 assertions, benchmarking
- **REPL** - Interactive shell for learning

### ✅ AI Integration (Complete)
- LLM prompts as first-class syntax
- RAG (Retrieval-Augmented Generation)
- Embedding similarity
- Multi-tool agents

### ⏳ Incomplete (Phase 1)
- Documentation Generator
- Formatter & Linter
- Type Inference Engine
- Standard Library (25% complete)

---

## 📝 Language Basics

### Hello World
```swibe
fn main() {
  println("Hello, World!")
}
```

### Functions
```swibe
fn greet(name: str) -> str {
  "Hello, " + name
}

fn add(a: i32, b: i32) -> i32 {
  a + b
}
```

### Variables & Types
```swibe
let x = 42           // i32
let name = "Alice"   // str
let pi = 3.14        // f64
let active = true    // bool
let items = [1,2,3]  // array
```

### Control Flow
```swibe
// If-else
if x > 0 {
  println("positive")
} else {
  println("negative")
}

// For loop
for i in range(0, 10) {
  println(i)
}

// While loop
while count < 100 {
  count = count + 1
}

// Match
match value {
  1 => println("one"),
  2 => println("two"),
  _ => println("other")
}
```

### Structs & Enums
```swibe
struct Person {
  name: str,
  age: i32
}

enum Color {
  Red,
  Green,
  Blue
}
```

### AI Prompts
```swibe
fn classify(text: str) {
  %% classify this text as positive, negative, or neutral
}

fn summarize(article: str) -> str {
  %% summarize this article in 2-3 sentences
}
```

### Testing
```swibe
#[test]
fn test_addition() {
  assert!(2 + 2 == 4, "math broken")
}

#[bench(iterations=1000)]
fn bench_array_ops() {
  let arr = [1, 2, 3, 4, 5]
  map(arr, fn(x) { x * 2 })
}
```

---

## 📚 Available Functions

### Array Operations
```
len(arr)              // Length
push(arr, item)       // Add to end
pop(arr)              // Remove last
map(arr, fn)          // Transform
filter(arr, pred)     // Keep matching
reduce(arr, fn, init) // Aggregate
flatten(arr, depth)   // Flatten nested
unique(arr)           // Remove duplicates
sort(arr)             // Sort
reverse(arr)          // Reverse
find(arr, pred)       // Find first
includes(arr, item)   // Contains
```

### String Operations
```
str.len(s)            // Length
str.upper(s)          // Uppercase
str.lower(s)          // Lowercase
str.trim(s)           // Remove whitespace
str.split(s, sep)     // Split into array
str.replace(s, from, to)
str.contains(s, sub)  // Has substring
str.starts_with(s, p) // Starts with
str.ends_with(s, s)   // Ends with
str.reverse(s)        // Reverse
str.pad_left(s, w)    // Pad left
str.pad_right(s, w)   // Pad right
```

### Math Functions
```
abs(n)       // Absolute value
min(...nums) // Minimum
max(...nums) // Maximum
floor(n)     // Round down
ceil(n)      // Round up
round(n)     // Round nearest
sqrt(n)      // Square root
pow(base, e) // Power
log(n, base) // Logarithm
sin(n), cos(n), tan(n)
```

### Type Checking
```
type(val)        // Get type
is_array(val)
is_string(val)
is_number(val)
is_bool(val)
is_null(val)
is_option(val)   // Option type
is_result(val)   // Result type
```

### I/O
```
print(...)      // Output
println(...)    // Output with newline
input(prompt)   // Read input
format(template, args...)
```

---

## 🧪 Testing

### Run Tests
```bash
cd swibe
node -e "
const { TestRunner, Assertions } = require('./src/testing');
const runner = new TestRunner();

runner.registerTest('basic', () => {
  Assertions.assertEquals(2 + 2, 4);
});

runner.runTests();
"
```

### Test Assertion API
```javascript
assert(condition, message)
assertEquals(actual, expected, message)
assertTrue(value, message)
assertFalse(value, message)
assertNull(value, message)
assertThrows(fn, message)
assertArrayEquals(actual, expected, message)
assertObjectEquals(actual, expected, message)
assertStringContains(str, substring, message)
```

---

## 🎨 VSCode Setup

1. **Install Extension:**
   ```bash
   cd vscode-extension
   npm install
   npm run compile
   # Copy to ~/.vscode/extensions/swibe-0.1.0/
   ```

2. **Create `.swibe` file** - Extension auto-activates

3. **Features Available:**
   - Syntax highlighting
   - Code completion (Ctrl+Space)
   - Go to definition (F12)
   - Document symbols (Ctrl+Shift+O)
   - Code snippets
   - Dark/Light themes

---

## 🌐 Web Playground

### Start Server
```bash
cd web-playground
npm install
node server.js
# http://localhost:3000
```

### Features
- Write Swibe code in Monaco editor
- Click "Compile" or Ctrl+Enter
- Select target language
- Share via URL copy
- Toggle light/dark theme
- View compiled output

### API Endpoints
```
POST /api/compile
POST /api/format
POST /api/parse
GET /api/targets
GET /api/examples
GET /api/health
```

---

## 📊 Compilation Targets

**Currently Supported:**
- JavaScript (Node.js, browsers)
- Python (basic)

**Planned:**
- Rust, Go, Java, C++, TypeScript, Kotlin, Swift, PHP, Ruby, Perl, Haskell, Clojure, Prolog, Lua, Dart, Nim

---

## 🔗 Important Files

| File | Purpose | Status |
|------|---------|--------|
| `src/lexer.js` | Tokenizer | ✅ Complete |
| `src/parser.js` | Parser | ✅ Complete |
| `src/compiler.js` | Code generator | ✅ Complete |
| `src/stdlib.js` | Built-in functions | ⏳ 25% |
| `src/testing.js` | Test framework | ✅ Complete |
| `vscode-extension/` | IDE support | ✅ Complete |
| `web-playground/` | Browser IDE | ✅ Complete |
| `ACTUAL_ROADMAP.md` | Progress tracking | ✅ Updated |

---

## 🚀 Next to Build

1. **Documentation Generator** (1-2 weeks)
2. **Formatter & Linter** (2 weeks)
3. **Type Inference** (2-3 weeks)
4. **Complete Stdlib** (1-2 weeks)

Then Phase 2:
- Package Manager
- API Generator
- Database Schema Gen
- And 7 more features

---

## 📞 Common Issues

### Problem: Module not found
**Solution:** `npm install` in the directory

### Problem: Port 3000 in use
**Solution:** `PORT=3001 node server.js`

### Problem: Extension not loading
**Solution:** Reload window (Ctrl+Shift+P → "Developer: Reload Window")

---

## 📖 Resources

- **Language Spec:** `VIBE_SPEC.md`
- **Examples:** `examples/` directory
- **Roadmap:** `ACTUAL_ROADMAP.md`
- **Build Status:** `PHASE1_BUILD_COMPLETE.md`

---

**Happy coding with Swibe! 🎵**
