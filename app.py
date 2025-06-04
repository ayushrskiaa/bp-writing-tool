from flask import Flask, render_template, request, jsonify
from ai4bharat.transliteration import XlitEngine

app = Flask(__name__)
engine = XlitEngine("hi", beam_width=10, rescore=True)  # 'hi' for Hindi

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transliterate', methods=['POST'])
def translit():
    data = request.json
    word = data.get('word', '')
    # Only support Hinglish (Roman) to Devanagari
    result = engine.translit_word(word, topk=5)
    suggestions = result['hi'] if 'hi' in result else []
    suggestions.append(word)
    return jsonify({'suggestions': suggestions[:5]})

if __name__ == '__main__':
    app.run(debug=True) 