import os
import base64
import requests
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)  

# i put my hugging face model here. And I copied my access token.
API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev"
HF_TOKEN = os.getenv("HF_TOKEN")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json()

    # Test
    if not data or 'prompt' not in data:
        return jsonify({"error": "Missing prompt in request"}), 400

    prompt = data.get('prompt', '')
    overlay_text = data.get('overlayText', '')

    headers = {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt
    }

    try:


        response = requests.post(API_URL, headers=headers, json=payload, timeout=300)
        
        if response.status_code == 200 and "image" in response.headers.get("Content-Type", ""):
            b64_image = base64.b64encode(response.content).decode('utf-8')
            return jsonify({"image": b64_image})
        else:
            return jsonify({"error": response.text}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5011)
