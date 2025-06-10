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





Package                       Version
----------------------------- -----------
absl-py                       2.3.0
ai4bharat-transliteration     1.1.3
alabaster                     0.7.16
antlr4-python3-runtime        4.8
arabic-reshaper               3.0.0
asn1crypto                    1.5.1
astunparse                    1.6.3
attrs                         25.3.0
babel                         2.17.0
bitarray                      3.4.2
blinker                       1.9.0
Brotli                        1.1.0
cachetools                    5.5.2
certifi                       2025.4.26
cffi                          1.17.1
chardet                       5.2.0
charset-normalizer            3.4.2
click                         8.1.8
colorama                      0.4.6
cryptography                  43.0.3
cssselect2                    0.8.0
Cython                        3.1.1
dill                          0.4.0
docutils                      0.21.2
fairseq                       0.12.2
filelock                      3.18.0
Flask                         2.3.3
flask-cors                    6.0.0
flatbuffers                   25.2.10
fonttools                     4.58.1
fsspec                        2025.5.1
future                        1.0.0
gast                          0.4.0
gevent                        25.5.1
google-auth                   2.40.3
google-auth-oauthlib          0.4.6
google-pasta                  0.2.0
greenlet                      3.2.2
grpcio                        1.72.1
h5py                          3.13.0
html5lib                      1.1
hydra-core                    1.0.7
idna                          3.10
imagesize                     1.4.1
importlib_metadata            8.7.0
indic-nlp-library             0.92
itsdangerous                  2.2.0
Jinja2                        3.1.6
joblib                        1.5.1
keras                         2.10.0
Keras-Preprocessing           1.1.2
libclang                      18.1.1
lxml                          5.4.0
Markdown                      3.8
markdown-it-py                3.0.0
MarkupSafe                    3.0.2
mdurl                         0.1.2
ml_dtypes                     0.5.1
mock                          5.2.0
Morfessor                     2.0.6
mpmath                        1.3.0
namex                         0.1.0
networkx                      3.2.1
numpy                         1.23.5
oauthlib                      3.2.2
omegaconf                     2.0.6
opt_einsum                    3.4.0
optree                        0.16.0
oscrypto                      1.3.0
packaging                     25.0
pandas                        1.5.3
pdfkit                        1.0.0
pillow                        11.2.1
pip                           23.2.1
portalocker                   3.1.1
progressbar2                  4.5.0
promise                       2.3
protobuf                      3.20.3
pyarrow                       20.0.0
pyasn1                        0.6.1
pyasn1_modules                0.4.2
pycparser                     2.22
pydload                       1.0.9
pydyf                         0.11.0
Pygments                      2.19.1
pyHanko                       0.29.0
pyhanko-certvalidator         0.27.0
pypdf                         5.6.0
pyphen                        0.17.2
python-bidi                   0.6.6
python-dateutil               2.9.0.post0
python-utils                  3.9.1
pytz                          2025.2
pywin32                       310
PyYAML                        6.0.2
regex                         2024.11.6
reportlab                     4.4.1
requests                      2.32.3
requests-oauthlib             2.0.0
rich                          14.0.0
rsa                           4.9.1
sacrebleu                     2.5.1
sacremoses                    0.1.1
setuptools                    49.2.1
six                           1.17.0
snowballstemmer               3.0.1
Sphinx                        7.4.7
sphinx-argparse               0.4.0
sphinx-rtd-theme              3.0.2
sphinxcontrib-applehelp       2.0.0
sphinxcontrib-devhelp         2.0.0
sphinxcontrib-htmlhelp        2.1.0
sphinxcontrib-jquery          4.1
sphinxcontrib-jsmath          1.0.1
sphinxcontrib-qthelp          2.0.0
sphinxcontrib-serializinghtml 2.0.0
svglib                        1.5.1
sympy                         1.13.1
tabulate                      0.9.0
tensorboard                   2.10.1
tensorboard-data-server       0.6.1
tensorboard-plugin-wit        1.8.1
tensorboardX                  2.6.2.2
tensorflow                    2.10.1
tensorflow-addons             0.22.0
tensorflow-datasets           3.2.1
tensorflow-estimator          2.10.0
tensorflow-io-gcs-filesystem  0.31.0
tensorflow-metadata           1.17.1
termcolor                     3.1.0
tf2crf                        0.1.33
tinycss2                      1.4.0
tinyhtml5                     2.0.0
tomli                         2.2.1
torch                         2.5.0
torchaudio                    2.5.0
tqdm                          4.67.1
typeguard                     2.13.3
typing_extensions             4.14.0
tzdata                        2025.2
tzlocal                       5.3.1
ujson                         5.10.0
urduhack                      0.1.4
uritools                      5.0.0
urllib3                       2.4.0
weasyprint                    65.1
webencodings                  0.5.1
Werkzeug                      3.1.3
wheel                         0.45.1
wrapt                         1.17.2
zipp                          3.22.0
zope.event                    5.0
zope.interface                7.2
zopfli                        0.2.3.post1