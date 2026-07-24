# Firmware and field-device guide

## Water monitor

`firmware/water_monitor/water_monitor.ino` targets an Arduino Uno and uses:

- one waterproof DS18B20 temperature sensor on digital pin 2;
- a 4.7 kΩ pull-up resistor between the DS18B20 data line and 5 V;
- an optional analog probe interface on A0;
- the Arduino `OneWire` and `DallasTemperature` libraries.

Every five seconds it emits newline-delimited JSON at 9600 baud:

```json
{
  "type": "water_observation",
  "uptime_ms": 5000,
  "temperature_celsius": 24.31,
  "analog_probe_raw": 612
}
```

The analog value is intentionally raw. pH, dissolved oxygen, and turbidity probes require
probe-specific circuits, temperature compensation, and calibration. Labeling an uncalibrated analog
value as a water-quality measurement would create false confidence.

## Feeder controller

`firmware/feeder_controller/feeder_controller.ino` drives a servo signal on digital pin 9. Send a
newline-terminated duration command at 9600 baud:

```text
FEED 1200
```

The controller rejects zero, values over 5 seconds, malformed commands, and commands during a
30-second cooldown. It starts and resets with the gate closed and returns a JSON acknowledgement.

Do not power a servo from the Arduino's regulator. Use a suitable external supply, connect grounds,
add an accessible physical stop, and test without feed or animals first. Calibrate dispensed grams
against duration for each feed pellet and hopper geometry; duration is not a feed quantity.

## Gateway contract (planned)

The gateway should add `deviceId`, `cultureUnitId`, and a UTC timestamp before uploading sensor messages. It
should spool messages locally during outages, use unique command IDs, ignore duplicate commands, and
upload feeder acknowledgements. Serial JSON is a development transport, not an Internet protocol.
