# Pond and cage alignment

Feed Sync aligns with both systems by modeling a stocked `CultureUnit` whose profile is explicitly a
`PondProfile` or `CageProfile`. Feeding events, observations, plans, and commands refer to the shared
unit identifier; system-specific geometry and environmental inputs remain distinct.

## Fit by system

| Concern              | Earthen/liner pond                                               | Lake cage                                                                  |
| -------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Geometry             | Surface area and average depth                                   | Cage volume, site depth, and optional mesh size                            |
| Stocking context     | Count, average weight, effective pond volume                     | Count, average weight, cage volume                                         |
| KijaniSpace value    | Rainfall, air temperature, and wind help explain pond conditions | Wind and weather help with operating conditions and exposure               |
| Essential local data | Water temperature, dissolved oxygen, pH, water level/turbidity   | Multi-depth temperature and oxygen, current, waves, net condition          |
| Feeding risk         | Runoff, stratification, oxygen dips, and water exchange          | Current-driven feed loss, low oxygen, rough access, and cage deformation   |
| Sensor placement     | Representative feeding zone, shaded and serviceable              | Protected mount; often more than one depth because the water column varies |

## What KijaniSpace does and does not provide

The documented water endpoint returns water-relevant **weather** such as temperature, wind speed,
and precipitation. A live test also returned static lake context including climatological water
temperature and bathymetry. This is useful contextual input for ponds and cages, but it does not
establish real-time in-pond or in-lake water temperature, dissolved oxygen, pH, currents, or waves.

Therefore:

- label KijaniSpace values as forecast/regional context, not on-site sensor readings;
- keep provider timestamps and freshness visible;
- require local observations before environmental rules reduce or suspend feeding;
- add current and wave sources before making cage-specific operational claims;
- never infer safe feeding conditions from forecast availability alone.

## Recommendation model direction

The base feed estimate can share inputs—species, life stage, biomass, feed table, recent intake, and
health—but environmental modifiers must be system-specific. Pond rules should consider pond depth,
water exchange, rainfall, and oxygen dynamics. Cage rules should consider current, water-column
oxygen and temperature, wind/waves, and feed drift. Keep both rule sets transparent and reviewed by
local aquaculture expertise.
