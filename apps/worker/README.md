# Mathematical Animation Worker 🎬

This service generates beautiful mathematical animations using **Manim** - the same library used by 3Blue1Brown for creating stunning educational content.

## Why Manim? 🎯

Manim (Mathematical Animation Engine) is specifically designed for:
- 📐 Perfect mathematical shapes and rendering (no square/circle issues)
- 🎓 Educational content like 3Blue1Brown
- 🧮 Mathematical equations and formulas with LaTeX support
- 📊 Coordinate systems, graphs, and transformations
- 🎨 Beautiful, publication-quality animations

## Quick Setup 🚀

### 1. Install Python Dependencies (Required)
```bash
python setup_manim.py
```

### 2. Install Node.js Dependencies
```bash
bun install
```

### 3. Run the Service
```bash
bun run index.ts
```

## Manual Manim Installation 🔧

If the automatic setup doesn't work:

```bash
# Install Python 3.8+ first, then:
pip install manim
pip install pillow
```

For system dependencies (varies by OS):
- **Windows**: Install Visual Studio Build Tools
- **macOS**: `brew install cairo pango ffmpeg`
- **Linux**: `sudo apt install libcairo2-dev libpango1.0-dev ffmpeg`

## Features ✨

- 🎬 High-quality mathematical animation rendering
- 🌐 S3 upload for video storage with fallback to local files
- 📐 Support for complex mathematical concepts
- 🎯 3Blue1Brown-style educational animations
- 🔄 Automatic fallback if Manim installation fails

## Example Manim Code 📝

The system now generates Python code like this:

```python
from manim import *

class CircleAnimation(Scene):
    def construct(self):
        circle = Circle(radius=1, color=BLUE)
        self.play(Create(circle))
        self.play(circle.animate.shift(RIGHT * 2))
        self.wait(1)
```

This creates perfect circles, smooth animations, and professional mathematical content!

## Environment Variables 🔐

```bash
# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
AWS_REGION=us-east-1
```

Created with [Bun](https://bun.sh) and powered by [Manim Community Edition](https://www.manim.community/)
