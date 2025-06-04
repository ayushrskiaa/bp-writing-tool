# Hinglish to Devanagari Web App

A simple, production-quality web app for fast and accurate Hinglish (Roman Hindi) to Devanagari (Hindi script) transliteration with suggestions, powered by AI4Bharat's IndicXlit.

## Features
- Type Hinglish and get instant Devanagari suggestions.
- Press space to auto-replace the last word with the top suggestion.
- Click on any word to see and select from multiple suggestions.
- Clean, modern, responsive UI.

## Requirements
- **Python 3.9** (required for compatibility with `fairseq` and `ai4bharat-transliteration`)
- **pip 23.x** (recommended for dependency compatibility)
- **Node.js** is NOT required (pure Python + HTML/JS)

## Setup Instructions

### 1. Install Python 3.9
- On macOS (with Homebrew):
  ```bash
  brew install python@3.9
  ```
- Or with pyenv:
  ```bash
  pyenv install 3.9.19
  pyenv local 3.9.19
  ```

### 2. Create and activate a virtual environment
```bash
python3.9 -m venv .venv
source .venv/bin/activate
```

### 3. Upgrade pip (important!)
```bash
pip install --upgrade pip==23.2.1
```

### 4. Uninstall any existing torch/torchaudio (important!)
```bash
pip uninstall torch torchaudio
```

### 5. Install dependencies (with correct versions)
```bash
pip install flask==3.0.3 ai4bharat-transliteration==1.1.3 torch==2.5.0 torchaudio==2.5.0
```

> **Note:**
> - Do NOT use Python 3.10+ or pip 24+ (as of 2024) due to incompatibilities with `fairseq` and PyTorch model loading.
> - The first run will download the AI4Bharat models automatically.

### 6. Run the app
```bash
python app.py
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

---

## File Structure
- `app.py` — Flask backend
- `templates/index.html` — Frontend UI
- `requirements.txt` — Python dependencies
- `README.md` — This file

---

## Troubleshooting
- If you see errors related to `fairseq`, `torch`, or model loading, double-check your Python and pip versions.
- If you see errors about `weights_only` or `dataclass`, you are likely using an unsupported Python or PyTorch version.

---

## Credits
- [AI4Bharat Transliteration (IndicXlit)](https://github.com/AI4Bharat/IndicTrans)
- [Flask](https://flask.palletsprojects.com/) 