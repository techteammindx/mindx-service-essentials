# Service TUI Interaction — Blessed Stack Deep Dive

**Date:** 2025-10-25

## Research Scope
- Assess the feasibility of building the Service-management TUI with Blessed/neo-blessed as the primary framework.
- Identify ecosystem tooling, JSON rendering techniques, and DX mitigations for Blessed’s imperative API.
- Provide guidance on integrating GraphQL/gRPC calls, testing, and structuring the tool within existing pnpm conventions.

## Blessed Ecosystem Landscape
- **neo-blessed:** Actively maintained fork that preserves Blessed’s widget catalog (boxes, lists, text areas) and optimized renderer while addressing backlog defects [1].
- **Core Capabilities:** Screens, boxes, and event APIs support bordered panes, key bindings, mouse input, and layout via absolute positioning—sufficient to mirror the menu + JSON panels required by the spec [1].
- **Maintenance Risks:** Upstream Blessed is effectively unmaintained; community forks like neo-blessed or higher-level wrappers (react-tui) acknowledge slow ecosystem activity and invest in TypeScript shims to reduce friction [2].

## Rendering JSON & Layout Patterns
- Blessed boxes accept raw string content and can be re-rendered with `box.setContent(...)`, enabling verbatim JSON dumps with inline formatting [1].
- Rolling log widgets from blessed-contrib provide scrollable panes for streaming responses or error traces (`log.log(line)`), which can host pretty-printed JSON payloads when combined with `JSON.stringify(payload, null, 2)` [3].
- For large payloads, combine `scrollable: true`, `keys: true`, and `mouse: true` on boxes or logs to enable navigation without truncating payloads [1][3].

```ts
box.setContent(JSON.stringify(payload, null, 2));
screen.render();
```

## Transport Integration Strategy
- Encapsulate backend calls inside gateway modules (GraphQL vs. gRPC) and inject results into Blessed widgets to keep terminal rendering separate from networking concerns.
- GraphQL fits lightweight clients such as Graffle; gRPC pairs with nice-grpc or grpc-js, while Blessed remains transport-agnostic because it only receives formatted strings.
- Use async handlers on menu keypresses to await gateway calls, update content boxes, and call `screen.render()` ensuring UI remains responsive.

## Developer Experience & Testing
- **TypeScript Support:** Blessed’s API surface is wide; leverage neo-blessed typings or wrapper libraries (react-tui) to gain partial compile-time safety [2].
- **Component Abstractions:** Consider react-tui or custom factories to impose declarative structure, reducing manual coordinate math for grids, scrollbars, and focus management [2].
- **Testing Harness:** Headless rendering can stub Blessed screen methods; snapshotting `box.content` after gateway mocks verifies JSON output without full terminal emulation. Pair with Vitest for logic tests and run smoke E2E via node-pty.

## Key Considerations
| Dimension | Guidance | Impact |
| --- | --- | --- |
| Layout Model | Embrace absolute positioning with helper grids where needed | Ensures predictable pane layouts for menu + JSON panels. |
| Ecosystem | Standardize on neo-blessed and optional react-tui wrappers | Mitigates maintenance gaps while retaining compatibility with core widgets. |
| Performance | Leverage CSR/BCE optimizations and scrollable boxes [1] | Handles large JSON payloads efficiently with minimal redraw overhead. |
| DX | Provide wrapper factories, TypeScript helper types, and docs | Softens the learning curve for trainees working with the imperative API. |

## Recommendation
- Adopt Blessed (via neo-blessed) as the canonical framework for the Service TUI.
- Layer optional abstractions (e.g., react-tui grids) only to ease layout math while keeping Blessed widgets the single source of truth.
- Maintain transport gateways and UI helpers in the proposed structure so the team can scale features without reconsidering frameworks.

## Minimal Project Structure Update
```
/src
  /clients
    /tui
      main.ts
      /ui
        index.ts
  /domain
  /application
  /infrastructure
  ...
/docker
  Dockerfile
  docker-compose.yaml
  /scripts
.dockerignore
```
- Keep the TUI co-located under `src/clients` so it shares the primary `package.json` while remaining separated from core domain layers.
- Expose gRPC descriptors from the running service; the TUI fetches them over localhost at startup instead of storing generated protobuf files.

## Implementation Guidelines
- Structure the tool under `/src/clients/tui` with separate folders for `screen`, `widgets`, and `flows`; expose a factory that creates standard panes (menu, JSON output, error banner).
- Normalize backend responses before rendering and reuse a utility that formats JSON plus optional ANSI highlighting without mutating payload order.
- Register global exit keys (`['escape', 'q', 'C-c']`) and ensure clean teardown to avoid lingering terminal modes.
- Provide ergonomics for learners by wrapping widget creation in functions (`createJsonPanel(options)`) so they avoid direct coordinate math for every flow.

## Follow-up Questions
1. Should we adopt react-tui to regain a declarative component model on top of neo-blessed, or keep the API imperative for training clarity?
2. Do we need to support streaming updates (e.g., long-running quote operations), influencing the choice between `box` and `log` widgets?
3. What level of keyboard/mouse accessibility is expected (e.g., universal shortcuts, focus traps), and do we need to extend Blessed’s default handlers?
4. Are we targeting cross-platform parity (Windows terminals) that might require testing Blessed’s BCE/CSR optimizations across console hosts?

## References
1. *neo-blessed README* — Maintained fork outlining screen, box, and rendering APIs [https://github.com/embarklabs/neo-blessed/blob/master/README.md]
2. *react-tui Manual* — Notes on improving Blessed usability and acknowledging limited maintenance [https://github.com/dino-dna/react-tui/blob/main/docs/manual.md]
3. *blessed-contrib README* — Demonstrates log widget for streaming textual content [https://github.com/yaronn/blessed-contrib/blob/master/README.md]
