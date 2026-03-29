# AI Energy Manager (Groq API)

This module adds autonomous AI logic to your Smart Off-grid Photovoltaic System using the Groq API.

## How It Works
- The script (`ai_manager.py`) sends sensor data (Voltage, Temperature, Current) to the Groq LLM.
- The AI analyzes the data and returns a JSON response to control 3 relays:
  - `relay_1`: Main Load
  - `relay_2`: Secondary Load (Power Saving)
  - `relay_3`: Cooling System/Safety
- The AI also provides a brief `maintenance` status message.

## Decision Logic
- **If Temperature > 45°C**: The AI may turn off (set to 0) the main or secondary load, and turn on the cooling relay.
- **If Voltage < 11V**: The AI may cut non-essential loads to protect the battery.
- **Otherwise**: All relays remain ON (1), and maintenance status is "System Healthy".

## Example Usage
```python
from ai_manager import query_groq

# Example sensor data
result = query_groq(voltage=12.3, temperature=38.5, current=4.2)
print(result)
# Output: {'relay_1': 1, 'relay_2': 1, 'relay_3': 0, 'maintenance': 'System Healthy'}
```

## Integration with ESP32
- The backend can expose an API endpoint (e.g., `/api/relay-state`) that calls `query_groq()` with the latest sensor data.
- The ESP32 can fetch this endpoint and receive a JSON like:
  ```json
  { "relay_1": 1, "relay_2": 0, "relay_3": 1, "maintenance": "Check battery cells" }
  ```
- The ESP32 then sets its relay pins accordingly.

## Security
- The Groq API key is read from the environment variable `GROQ_API_KEY` (default is set in the script for demo/testing).

---
For more details, see `backend/ai_manager.py`.
