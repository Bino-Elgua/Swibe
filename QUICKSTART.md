# Swibe Language - Quick Start

## Installation

```bash
cd swibe
npm install
```

## Try It Now

### 1. Interactive REPL
```bash
npm run repl
```

Then type:
```
swibe> fn greet(name: str) { print("Hello " + name) }
swibe> fn add(a: i32, b: i32) -> i32 { a + b }
swibe> add(5, 3)
```

### 2. Compile Examples
```bash
# JavaScript (default)
npm run compile examples/hello.swibe

# Python
npm run compile examples/hello.swibe -- --target python

# Rust
npm run compile examples/hello.swibe -- --target rust
```

### 3. Write Your Own File

Create `hello.swibe`:
```swibe
fn main() {
  print("Hello, Swibe!")
}

fn add(a: i32, b: i32) -> i32 {
  a + b
}

fn greet(name: str) -> str {
  "Hello, " + name
}
```

Compile:
```bash
node src/index.js compile hello.swibe
```

## Language Basics

### Functions
```swibe
fn add(x: i32, y: i32) -> i32 {
  x + y
}
```

### Types
- `i32`, `i64` - integers
- `f32`, `f64` - floats
- `str` - strings
- `bool` - booleans
- `[T]` - arrays
- `Option<T>` - nullable type

### Variables
```swibe
x = 10              -- immutable
mut y = 20          -- mutable
z: i32 = 30         -- with type annotation
```

### Structs
```swibe
struct Point {
  x: i32,
  y: i32
}

p = Point { x: 10, y: 20 }
```

### Enums
```swibe
enum Color {
  Red,
  Green,
  Blue
}
```

### Match
```swibe
match value {
  Some(n) => print(n),
  None => print("empty")
}
```

### Pipelines
```swibe
data
  |> filter(x => x > 5)
  |> map(x => x * 2)
```

## AI Features

### Prompts
Use `%%` to ask AI to generate code:
```swibe
fn fibonacci(n: i32) {
  %% generate fibonacci sequence up to n
}
```

### Voice Input
```swibe
%% [voice: "create a function that validates email addresses"]
```

### AI Generation
```swibe
response = ai.generate("write a poem about programming")
```

### RAG (Search)
```swibe
docs = rag.search("how to use swibe language", top_k=5)
```

## Compilation Targets

| Target | Status | Example |
|--------|--------|---------|
| JavaScript | ✓ Full | `swibe compile app.swibe` |
| Python | ✓ Full | `swibe compile app.swibe --target python` |
| Rust | ✓ Core | `swibe compile app.swibe --target rust` |
| Go | 🚧 WIP | Coming soon |

## Examples

### Hello World
```swibe
fn main() {
  print("Hello, World!")
}
```

### Fibonacci
```swibe
fn fibonacci(n: i32) -> [i32] {
  if n <= 1 {
    [n]
  } else {
    fib = fibonacci(n - 1)
    fib + [fib[-1] + fib[-2]]
  }
}
```

### Multiple Dispatch
```swibe
fn type_name(x: i32) -> str { "integer" }
fn type_name(x: str) -> str { "string" }
fn type_name(x: [i32]) -> str { "array" }
```

### Safe Division
```swibe
fn safe_divide(a: i32, b: i32) -> Option<i32> {
  if b == 0 { None } else { Some(a / b) }
}

match safe_divide(10, 2) {
  Some(result) => print(result),
  None => print("Cannot divide by zero")
}
```

### AI-Powered Function
```swibe
fn analyze_text(text: str) {
  %% Analyze this text for sentiment, extracting keywords: {text}
}
```

## Troubleshooting

**Syntax Error?**
- Check [VIBE_SPEC.md](VIBE_SPEC.md) for syntax rules
- Use REPL to test incrementally
- Enable debug with `DEBUG=true npm run compile`

**Compilation Issues?**
- Ensure types match function signatures
- Use type annotations for clarity
- Check target language limitations

**Want to Use Real LLM?**
- Set `ANTHROPIC_API_KEY` in `.env`
- Or use Ollama: `ollama serve`
- Or HuggingFace: set `HF_TOKEN`

## Next Steps

1. **Read** [VIBE_SPEC.md](VIBE_SPEC.md) for complete language spec
2. **Explore** `examples/` folder for more patterns
3. **Build** your own `.swibe` files
4. **Share** your creations

## Resources

- **Language Spec**: [VIBE_SPEC.md](VIBE_SPEC.md)
- **Full Guide**: [README.md](README.md)
- **Project Summary**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **Examples**: `examples/hello.swibe`, `examples/ai-app.swibe`

## Questions?

Check the spec or try the REPL:
```bash
npm run repl
swibe> help
```

---

**Have fun coding in Swibe!** 🎵
