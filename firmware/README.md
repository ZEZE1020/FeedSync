# Feed Sync firmware

Independent Arduino prototypes for collecting local water observations and safely exercising a feed
gate. Firmware stays outside the JavaScript and Python package workspaces.

## Sketches

### `water_monitor`

Reads a waterproof DS18B20 on digital pin 2 and an optional raw analog probe on A0. It emits
newline-delimited JSON at 9600 baud every five seconds.

Required Arduino libraries:

- OneWire
- DallasTemperature

### `feeder_controller`

Controls a servo signal on digital pin 9. It accepts `FEED <duration_ms>` over serial, fails closed on
boot, rejects durations above five seconds and enforces a 30-second cooldown. It emits a JSON
acknowledgement for every accepted or rejected command.

## Build workflow

Open each `.ino` file as its own sketch in Arduino IDE, select the target board and port, install the
listed libraries, then verify before uploading. If using Arduino CLI:

```bash
arduino-cli compile --fqbn arduino:avr:uno firmware/water_monitor
arduino-cli compile --fqbn arduino:avr:uno firmware/feeder_controller
```

Pin mappings, wiring, payload examples, gateway responsibilities and safety guidance live in the
[firmware guide](../docs/firmware.md).

## Safety boundary

These are prototypes, not certified controllers. Test with the feeder disconnected, power servos
from an appropriate external supply with shared ground, add guards and a physical stop, and keep a
person able to interrupt operation. Raw analog values are not pH, oxygen or turbidity measurements
until the specific probe has been calibrated.
