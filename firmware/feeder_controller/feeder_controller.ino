#include <Servo.h>

constexpr uint8_t SERVO_PIN = 9;
constexpr uint8_t CLOSED_ANGLE = 10;
constexpr uint8_t OPEN_ANGLE = 75;
constexpr unsigned long MAX_OPEN_MS = 5000;
constexpr unsigned long COOLDOWN_MS = 30000;
constexpr size_t COMMAND_BUFFER_SIZE = 40;

Servo gate;
char commandBuffer[COMMAND_BUFFER_SIZE];
size_t commandLength = 0;
unsigned long lastFeedCompletedAt = 0;
bool hasFed = false;

void acknowledge(const char* status, unsigned long durationMs) {
  Serial.print(F("{\"type\":\"feeder_ack\",\"status\":\""));
  Serial.print(status);
  Serial.print(F("\",\"duration_ms\":"));
  Serial.print(durationMs);
  Serial.println(F("}"));
}

void executeFeed(unsigned long durationMs) {
  const unsigned long now = millis();
  if (durationMs == 0 || durationMs > MAX_OPEN_MS) {
    acknowledge("rejected_invalid_duration", durationMs);
    return;
  }
  if (hasFed && now - lastFeedCompletedAt < COOLDOWN_MS) {
    acknowledge("rejected_cooldown", durationMs);
    return;
  }

  gate.write(OPEN_ANGLE);
  delay(durationMs);
  gate.write(CLOSED_ANGLE);
  lastFeedCompletedAt = millis();
  hasFed = true;
  acknowledge("completed", durationMs);
}

void processCommand() {
  commandBuffer[commandLength] = '\0';
  if (strncmp(commandBuffer, "FEED ", 5) != 0) {
    acknowledge("rejected_unknown_command", 0);
    return;
  }

  char* endPointer;
  const unsigned long durationMs = strtoul(commandBuffer + 5, &endPointer, 10);
  if (endPointer == commandBuffer + 5 || *endPointer != '\0') {
    acknowledge("rejected_invalid_duration", 0);
    return;
  }
  executeFeed(durationMs);
}

void setup() {
  Serial.begin(9600);
  gate.attach(SERVO_PIN);
  gate.write(CLOSED_ANGLE); // Fail closed on boot or reset.
  Serial.println(F("{\"type\":\"feeder_status\",\"status\":\"ready\"}"));
}

void loop() {
  while (Serial.available() > 0) {
    const char incoming = Serial.read();
    if (incoming == '\n') {
      processCommand();
      commandLength = 0;
    } else if (incoming != '\r' && commandLength < COMMAND_BUFFER_SIZE - 1) {
      commandBuffer[commandLength++] = incoming;
    } else if (commandLength >= COMMAND_BUFFER_SIZE - 1) {
      commandLength = 0;
      acknowledge("rejected_command_too_long", 0);
    }
  }
}

