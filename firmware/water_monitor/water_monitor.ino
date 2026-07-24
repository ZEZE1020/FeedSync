#include <DallasTemperature.h>
#include <OneWire.h>

// DS18B20 data pin. Install the OneWire and DallasTemperature libraries.
constexpr uint8_t ONE_WIRE_BUS = 2;
// Optional analog probe. Its raw value is sent until a farm-specific calibration is available.
constexpr uint8_t ANALOG_PROBE_PIN = A0;
constexpr unsigned long SAMPLE_INTERVAL_MS = 5000;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature temperatureSensors(&oneWire);
unsigned long lastSampleAt = 0;

void setup() {
  Serial.begin(9600);
  temperatureSensors.begin();
  pinMode(ANALOG_PROBE_PIN, INPUT);
}

void loop() {
  const unsigned long now = millis();
  if (now - lastSampleAt < SAMPLE_INTERVAL_MS) {
    return;
  }
  lastSampleAt = now;

  temperatureSensors.requestTemperatures();
  const float temperatureCelsius = temperatureSensors.getTempCByIndex(0);
  const int analogRaw = analogRead(ANALOG_PROBE_PIN);

  Serial.print(F("{\"type\":\"water_observation\",\"uptime_ms\":"));
  Serial.print(now);
  Serial.print(F(",\"temperature_celsius\":"));
  if (temperatureCelsius == DEVICE_DISCONNECTED_C) {
    Serial.print(F("null"));
  } else {
    Serial.print(temperatureCelsius, 2);
  }
  Serial.print(F(",\"analog_probe_raw\":"));
  Serial.print(analogRaw);
  Serial.println(F("}"));
}

