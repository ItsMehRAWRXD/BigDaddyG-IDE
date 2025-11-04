# BigDaddyG Model Variants

All variants based on BigDaddyG core models with specialized system prompts and tuned parameters.

## Available Variants

### 1. **BigDaddyG C/C++** (`bigdaddyg-c`)
- **Focus**: C, C++, systems programming
- **Best for**: Low-level code, memory management, performance optimization
- **Temperature**: 0.3 (precise, deterministic)

### 2. **BigDaddyG C#** (`bigdaddyg-csharp`)
- **Focus**: C#, .NET, ASP.NET, Unity
- **Best for**: Enterprise apps, web services, game development
- **Temperature**: 0.35 (professional, consistent)

### 3. **BigDaddyG Visual Basic** (`bigdaddyg-visualbasic`)
- **Focus**: VB.NET, VBA, legacy VB6
- **Best for**: Office automation, Windows Forms, legacy maintenance
- **Temperature**: 0.4 (clear, beginner-friendly)

### 4. **BigDaddyG Python** (`bigdaddyg-python`)
- **Focus**: Python 3.x, data science, ML
- **Best for**: Data analysis, machine learning, scripting
- **Temperature**: 0.4 (Pythonic, clean)

### 5. **BigDaddyG JavaScript** (`bigdaddyg-javascript`)
- **Focus**: JS, TS, Node.js, React
- **Best for**: Web development, full-stack apps
- **Temperature**: 0.4 (modern, async-focused)

### 6. **BigDaddyG Image** (`bigdaddyg-image`)
- **Focus**: Image generation, computer vision
- **Best for**: AI art prompts, image processing, graphics
- **Temperature**: 0.7 (creative, detailed)

### 7. **BigDaddyG Assembly** (`bigdaddyg-asm`)
- **Focus**: x86/x64/ARM Assembly, reverse engineering
- **Best for**: Low-level code, shellcode, binary analysis, RawrZ integration
- **Temperature**: 0.2 (precise, deterministic)

### 8. **Cheetah Stealth** (`cheetah_stealth`)
- **Focus**: Security, privacy, stealth operations
- **Best for**: Security audits, penetration testing
- **Temperature**: 0.7 (fast, concise)

### 9. **Code Supernova** (`code_supernova`)
- **Focus**: Multi-language code generation
- **Best for**: Rapid prototyping, code completion
- **Temperature**: 0.7 (code-focused)

## Usage in IDE

The IDE automatically selects the best model based on file extension:
- `.c`, `.cpp`, `.h` → BigDaddyG C/C++
- `.cs` → BigDaddyG C#
- `.vb`, `.vba` → BigDaddyG Visual Basic
- `.py` → BigDaddyG Python
- `.js`, `.ts`, `.jsx`, `.tsx` → BigDaddyG JavaScript
- `.asm`, `.s`, `.nasm` → BigDaddyG Assembly
- Image generation requests → BigDaddyG Image

Or manually select via: **Settings → AI Model → Select Variant**

## Total Size
- **Core models**: 114 GB
- **Variants**: 9 specialist configurations (< 10 KB total)
- **Combined**: ~114 GB with all models

## Performance
- **1M token context** for all variants
- **Local inference** (no internet required)
- **GPU acceleration** when available
- **Typical response**: 2-10 seconds

