from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

@app.route("/generate", methods=["POST"])
def generate_slogan():
    try:
        data = request.json
        industry = data.get("industry", "engineering")
        tone = data.get("tone", "professional")

        # Dynamic prompt engineering
        prompt = f"""
        Generate 3 {tone} engineering slogans for {industry}.
        - Use {tone}-appropriate language (e.g., puns if 'funny').
        - Max 10 words per slogan.
        - Format as a numbered list.
        """

        # Call OpenRouter API
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",  # Required by OpenRouter
                "X-Title": "SloganForge"  # Your app name
            },
            json={
                "model": "openai/gpt-3.5-turbo",  # Free model option
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            }
        )
        response.raise_for_status()
        slogans = response.json()["choices"][0]["message"]["content"]
        return jsonify({"slogans": slogans})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)