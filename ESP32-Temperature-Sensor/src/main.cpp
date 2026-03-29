#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "SS2";
const char* password = "00000000";

// Firebase test endpoint
const char* firebaseHost = "https://fir-esp-16cb0-default-rtdb.europe-west1.firebasedatabase.app";
const char* firebasePath = "/sensorReadings.json"; // t9dr tbdlha l path li bghiti

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(firebaseHost) + String(firebasePath);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    String jsonPayload = "{\"temperature\":36.5, \"humidity\":76.7, \"source\":\"esp32_test\"}";
    int httpResponseCode = http.PUT(jsonPayload); // PUT katbdl l data, POST katzid

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.println(http.getString());
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}

void loop() {
  
}