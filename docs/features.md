# Feature recommendations

## Hackathon MVP

Build one end-to-end story that proves the shared workflow and the system differences:

1. Register one farm, one pond, and one cage with their respective geometry and stocking data.
2. Retrieve KijaniSpace context and show source time, freshness, and “regional forecast” labeling.
3. Add local temperature observations to each culture unit through the Arduino serial gateway.
4. Create draft plans from a transparent baseline table plus system-specific context.
5. Let a farmer adjust and approve each plan, then record actual feed.
6. Demonstrate one bounded feeder command and acknowledgement in a controlled setup.

The strongest demo is the trace: planned amount, inputs considered, farmer adjustment, actual amount,
and device acknowledgement—contrasting the pond and cage context.

## Next features

| Priority | Feature                                   | Why it matters                                                |
| -------- | ----------------------------------------- | ------------------------------------------------------------- |
| P1       | Offline-first daily log                   | Farms must keep recording through connectivity gaps           |
| P1       | Biomass sampling workflow                 | Biomass is central to both pond and cage feed estimates       |
| P1       | Input freshness and sensor-health alerts  | Prevents silent decisions from stale or failed sources        |
| P1       | Feed inventory and low-stock forecast     | Connects plans to real farm operations                        |
| P1       | Cage current/wave integration             | Regional weather alone is insufficient for cage operations    |
| P2       | Feed conversion ratio by production cycle | Shows efficiency without mixing unrelated units               |
| P2       | Kiswahili/localized interface             | Makes field workflows more accessible                         |
| P2       | Roles and approval audit                  | Separates operator and manager responsibilities               |
| P2       | SMS/WhatsApp summaries                    | Reaches users without requiring the web app                   |
| P3       | Camera-based appetite cues                | Can refine timing after collecting a suitable labeled dataset |
| P3       | Earth-observation trend overlays          | Adds regional context after the core workflow works           |

## Recommendation guardrails

- Start with aquaculture-expert-reviewed rules, not an opaque model.
- Require system type, species, life stage, biomass, feed specification, and current observations.
- Display rationale, input freshness, confidence, and missing inputs with every plan.
- Never interpret a failed source as a zero reading.
- Keep farmer approval mandatory until field trials establish safe operating limits.
- Track overrides as learning data without portraying them as operator error.

## Success measures

- percentage of events with planned and actual amounts;
- feed waste reported per culture unit and production cycle;
- median input age at decision time;
- plan acceptance and adjustment rates;
- command acknowledgement rate and time;
- feed conversion ratio and survival trends, split by pond/cage system.
