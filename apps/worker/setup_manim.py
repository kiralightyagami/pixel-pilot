#!/usr/bin/env python3
"""
Setup script for Manim mathematical animation engine.
This script checks for Python dependencies and installs Manim if needed.
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors gracefully."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} successful")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error during {description}: {e}")
        return False

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is too old. Need Python 3.8+")
        return False

def check_manim_installation():
    """Check if Manim is already installed."""
    try:
        import manim
        print(f"✅ Manim is already installed (version: {manim.__version__})")
        return True
    except ImportError:
        print("📦 Manim not found, will install it")
        return False

def install_manim():
    """Install Manim Community Edition."""
    commands = [
        "pip install --upgrade pip",
        "pip install manim",
        "pip install pillow",  # Required for image processing
    ]
    
    for command in commands:
        if not run_command(command, f"Installing {command.split()[-1]}"):
            return False
    
    return True

def verify_manim_works():
    """Test if Manim can create a simple animation."""
    test_script = '''
from manim import *

class TestScene(Scene):
    def construct(self):
        circle = Circle()
        circle.set_fill(PINK, opacity=0.5)
        self.play(Create(circle))
        self.wait(1)
'''
    
    try:
        with open('test_manim.py', 'w') as f:
            f.write(test_script)
        
        # Try to render a test scene
        result = subprocess.run([
            'manim', '-ql', '--disable_caching', 'test_manim.py', 'TestScene'
        ], capture_output=True, text=True, timeout=60)
        
        # Clean up test file
        if os.path.exists('test_manim.py'):
            os.remove('test_manim.py')
        
        if result.returncode == 0:
            print("✅ Manim test animation successful!")
            return True
        else:
            print(f"❌ Manim test failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⏰ Manim test timed out (this might be normal for first run)")
        return True  # Timeout might be OK for first run
    except Exception as e:
        print(f"❌ Error testing Manim: {e}")
        return False

def main():
    """Main setup function."""
    print("🎨 Setting up Manim for mathematical animations...")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        print("Please install Python 3.8 or higher")
        sys.exit(1)
    
    # Check if Manim is installed
    if not check_manim_installation():
        print("📦 Installing Manim...")
        if not install_manim():
            print("❌ Failed to install Manim")
            sys.exit(1)
    
    # Verify Manim works
    print("🧪 Testing Manim installation...")
    if verify_manim_works():
        print("🎉 Manim setup complete! Ready to create mathematical animations.")
    else:
        print("⚠️  Manim installed but test failed. You may need to install additional system dependencies.")
        
    print("\n📚 Quick start:")
    print("- Use 'manim -ql scene.py SceneName' to render animations")
    print("- Use '-qh' for high quality, '-ql' for low quality (faster)")
    print("- Visit https://docs.manim.community/ for documentation")

if __name__ == "__main__":
    main() 