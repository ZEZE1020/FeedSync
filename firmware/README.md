# Feed Sync firmware

Arduino sketches are deliberately kept outside the web and API package workspaces. Each sketch is an
independent starting point that can be opened with Arduino IDE or built with `arduino-cli`.

| Sketch              | Purpose                                                                             | Default board |
| ------------------- | ----------------------------------------------------------------------------------- | ------------- |
| `water_monitor`     | Emits temperature and an uncalibrated analog sensor value as newline-delimited JSON | Arduino Uno   |
| `feeder_controller` | Runs a servo-actuated feeder after a bounded serial command                         | Arduino Uno   |

Read [docs/firmware.md](../docs/firmware.md) before wiring or operating either sketch. Pin mappings,
required libraries, the serial protocol, and safety constraints are documented there.

These sketches are prototypes, not certified control systems. Test with the feeder disconnected,
add mechanical guards, and keep a person able to stop the device.
