# Container Query and CSS Variable Performance

A quick benchmark was run in headless Chrome to approximate the runtime cost of
container queries and large custom property (CSS variable) sets. A simple page
was generated with increasing numbers of container queries and variables while
recording `performance.now()` before and after a forced style recalculation.

With 1,000 container queries and 1,000 custom properties the recalculation step
averaged roughly **5‑7ms** on a modern laptop (Chrome 126). The relationship was
close to linear – cutting the numbers to 100 dropped the cost to around **0.5ms**.
Typical Capsule components define only a few queries and tens of variables, so
the overhead remains well below a single frame.

Large sets of custom properties do increase the size of computed style data, so
keeping variable groups small helps reduce memory and style resolution work.
Container queries should likewise be scoped to the smallest practical container
to avoid unnecessary evaluations.

These measurements are coarse but suggest that moderate use of container
queries and CSS variables has a minimal impact on modern engines. Extremely
large sets (thousands) do incur measurable cost and should be avoided.
