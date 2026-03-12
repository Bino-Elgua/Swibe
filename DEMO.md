# Swibe Language - Live Demo

## Quick Demo (Copy & Paste)

### 1. Basic Function
```bash
cat > demo.swibe << 'VIBE'
fn add(a: i32, b: i32) -> i32 { a + b }
fn multiply(a: i32, b: i32) -> i32 { a * b }
VIBE

node src/index.js compile demo.swibe
```

Output:
```javascript
function add(a, b) {
  a + b
}

function multiply(a, b) {
  a * b
}
```

### 2. Structs and Pattern Matching
```bash
cat > demo2.swibe << 'VIBE'
struct Point {
  x: i32,
  y: i32
}

enum Color {
  Red,
  Green,
  Blue
}
VIBE

node src/index.js compile demo2.swibe
```

Output:
```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const Color = { Red: 'Red', Green: 'Green', Blue: 'Blue' };
```

### 3. AI Generation (with prompts)
```bash
cat > demo3.swibe << 'VIBE'
fn fibonacci(n: i32) {
  %% generate fibonacci sequence up to n
}
VIBE

node src/index.js compile demo3.swibe
```

Output includes:
```javascript
/* Generated from prompt: generate fibonacci sequence up to n */
```

### 4. Compile to Python
```bash
cat > demo.swibe << 'VIBE'
fn greet(name: str) {
  print("Hello, " + name)
}
VIBE

node src/index.js compile demo.swibe --target python
```

Output:
```python
def greet(name):
  print("Hello, " + name)
```

### 5. Compile to Rust
```bash
node src/index.js compile demo.swibe --target rust
```

Output:
```rust
fn greet(name: String) {
  println!("Hello, {}", name);
}
```

## Interactive REPL Demo

```bash
npm run repl
```

Then try:
```
swibe> fn hello() { print("world") }
swibe> hello()
world

swibe> struct User { id: u64, name: str }
swibe> user = User { id: 1, name: "Alice" }

swibe> fn double(x: i32) -> i32 { x * 2 }
swibe> double(21)
42

swibe> %% write a function that checks if a number is prime
```

## Advanced Examples

### Multiple Dispatch
```swibe
fn process(x: i32) -> str { "integer" }
fn process(x: str) -> str { "string" }
fn process(x: [f64]) -> str { "float array" }
```

Compiles to:
```javascript
function process(x) { return "integer"; }
function process(x) { return "string"; }
function process(x) { return "float array"; }
```

### Option Types (No Nulls)
```swibe
fn divide(a: i32, b: i32) -> Option<i32> {
  if b == 0 { None } else { Some(a / b) }
}

match divide(10, 2) {
  Some(n) => print(n),
  None => print("error")
}
```

### Pipelines
```swibe
data
  |> filter(x => x > 5)
  |> map(x => x * 2)
  |> print()
```

## Performance Demo

Compile 100 functions:
```bash
node -e "
const { Compiler } = require('./src/compiler.js');

let code = '';
for(let i = 0; i < 100; i++) {
  code += \`fn func\${i}(x: i32) -> i32 { x + \${i} }\n\`;
}

const start = Date.now();
const c = new Compiler(code);
const result = c.compile();
const time = Date.now() - start;

console.log('Compiled 100 functions in ' + time + 'ms');
console.log('Output size: ' + result.length + ' bytes');
"
```

## Feature Showcase

### All Type Annotations
```swibe
-- Primitives
x: i32 = 42
y: f64 = 3.14
name: str = "Swibe"
flag: bool = true

-- Collections
arr: [i32] = [1, 2, 3]
opt: Option<i32> = Some(42)

-- Custom types
point: Point = Point { x: 0, y: 0 }
color: Color = Color.Red

-- Generics
first: fn<T>(arr: [T]) -> T
```

### All Operators
```swibe
a + b      -- addition
a - b      -- subtraction
a * b      -- multiplication
a / b      -- division
a % b      -- modulo

a == b     -- equality
a != b     -- inequality
a < b      -- less than
a <= b     -- less or equal
a > b      -- greater than
a >= b     -- greater or equal

a && b     -- logical AND
a || b     -- logical OR
!a         -- logical NOT

x |> f     -- pipeline
```

### All Control Flow
```swibe
if condition {
  -- then
} else {
  -- else
}

match value {
  pattern1 => result1,
  pattern2 => result2
}

for i in range {
  -- loop
}

while condition {
  -- loop
}
```

## One-Liners

```bash
# Compile and run
node src/index.js compile hello.swibe | node -

# Count tokens
node -e "const {Lexer}=require('./src/lexer.js');const l=new Lexer(require('fs').readFileSync('hello.swibe','utf8'));console.log(l.tokenize().length)"

# Test multiple targets
for target in javascript python rust; do echo "=== $target ==="; node src/index.js compile examples/hello.swibe --target $target | head -3; done
```

## Copy-Paste to Try Now

```bash
# 1. Create test file
echo 'fn main() { print("Hello Swibe!") }' > test.swibe

# 2. Compile to JavaScript
node swibe/src/index.js compile test.swibe

# 3. Compile to Python
node swibe/src/index.js compile test.swibe --target python

# 4. View examples
cat swibe/examples/hello.swibe
cat swibe/examples/ai-app.swibe

# 5. Run REPL
npm run repl
```

---

**That's the demo! Ready to build with Swibe?**
