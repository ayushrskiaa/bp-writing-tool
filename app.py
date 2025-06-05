from flask import Flask, render_template, request, jsonify, send_file, url_for
from ai4bharat.transliteration import XlitEngine
from io import BytesIO
import pdfkit
import os

app = Flask(__name__, static_folder='static')
engine = XlitEngine("hi", beam_width=10, rescore=True)

# Get absolute paths
current_dir = os.path.dirname(os.path.abspath(__file__))

# Configure wkhtmltopdf path
wkhtmltopdf_path = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transliterate', methods=['POST'])
def translit():
    data = request.json
    word = data.get('word', '')
    result = engine.translit_word(word, topk=5)
    suggestions = result['hi'] if 'hi' in result else []
    suggestions.append(word)
    return jsonify({'suggestions': suggestions[:5]})

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    data = request.json
    text = data.get('text', '')
    
    html_content = f'''
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    margin: 2cm;
                }}
                body {{
                    font-family: "Noto Sans Devanagari", Mangal;
                    font-size: 16pt;
                    line-height: 1.5;
                    white-space: pre-wrap;
                }}
                div {{
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }}
            </style>
        </head>
        <body>
            <div>{text}</div>
        </body>
    </html>
    '''
    
    options = {
        'encoding': 'UTF-8',
        'enable-local-file-access': None,
        'page-size': 'A4',
        'orientation': 'Portrait',
        'margin-top': '20mm',
        'margin-right': '20mm',
        'margin-bottom': '20mm',
        'margin-left': '20mm',
        'print-media-type': None,
        'quiet': None
    }
    
    try:
        pdf = pdfkit.from_string(
            html_content, 
            False, 
            options=options, 
            configuration=config
        )
        
        return send_file(
            BytesIO(pdf),
            as_attachment=True,
            download_name="exported_text.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({"error": "Failed to generate PDF"}), 500

if __name__ == '__main__':
    app.run(debug=True)