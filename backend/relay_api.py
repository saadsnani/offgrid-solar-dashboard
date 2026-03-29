from flask import Flask, request, jsonify
from ai_manager import query_groq

app = Flask(__name__)

@app.route('/api/relay-state', methods=['POST'])
def relay_state():
    data = request.get_json(force=True)
    voltage = float(data.get('voltage', 12.0))
    temperature = float(data.get('temperature', 25.0))
    current = float(data.get('current', 0.0))
    try:
        ai_decision = query_groq(voltage, temperature, current)
        return jsonify(ai_decision)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
