# Engagefully

**Engagefully** by [Makefully](https://makefullystudios.com) turns keyboard, gamepad, pointer, and other devices into a single controller of typed actions (Button, Joystick, Pointer, …), plus a logical **ActionMap** for named game actions.

> Early `0.x` API — expect breaking changes.

## Install

```bash
npm install @makefully/engagefully
```

Bundlers (Vite, etc.) may need the Node `events` polyfill — it is declared as a dependency of this package.

## Quickstart

```js
import {
  Controller,
  ActionMap,
  devices,
  quantizeStick,
  focusGate,
} from '@makefully/engagefully';

const controller = new Controller([
  new devices.KeyboardDevice(),
  new devices.GamepadDevice(),
]);

const actions = new ActionMap(controller, {
  take: ['Space', 'AButton'],
  drop: ['KeyF', 'BButton'],
  move: [
    { control: 'KeyW', data: { offset: 0 } },
    { control: 'KeyE', data: { offset: 1 } },
  ],
}, {
  enabled: focusGate({ extra: () => helpOpen }),
  preventDefault: true,
  autoTick: true,
});

actions.on('take:pressed', () => { /* pickup */ });
actions.on('move:pressed', (e) => { /* e.data.offset */ });
actions.on('move:held', (e) => { /* each frame while held */ });
actions.on('move:released', () => { /* stop chaining */ });

// Stick → N sectors (game maps sector → direction):
controller.on('LeftStick', (event) => {
  const q = quantizeStick(event.x, event.y, { sectors: 6, deadzone: 0.35 });
  // q?.sector → 0..5 or null in deadzone
});
```

### Physical control ids

| Device | Examples |
|--------|----------|
| Keyboard | `KeyW`, `Space`, `ArrowUp` (`event.code`) |
| Gamepad | `AButton`, `BButton`, `XButton`, `YButton`, `LeftStick`, `UpDPad`, … |
| Pointer | `Pointer` |

You can still listen to physical ids on `Controller` directly (`KeyW:pressed`, `poll('Space')`).

### ActionMap

- Many physical controls → one logical action; `:pressed` / `:released` aggregate across bindings.
- Binding `data` is passed through on events (keep game-specific metadata in the game).
- `held(action)` / `heldEvent(action)` / `clearHeld()` / `dispose()`.
- `preventDefault: true` captures keyboard codes in the map so Space/arrows don’t scroll the page.
- `enabled` (e.g. `focusGate`) ignores presses while typing or when chrome blocks input.

### Utils

- **`quantizeStick(x, y, { sectors, deadzone, forward })`** → `{ sector }` or `null`
- **`focusGate({ extra })`** → `() => boolean` for `ActionMap` `enabled`

## Devices

**First-class:** `KeyboardDevice`, `GamepadDevice`, `PointerDevice`

**Also included (experimental):** `BLEDevice`, `FabricDevice`, `PixiDevice`, `PageDevice`

## Publishing

Bump `package.json` `version`, add a `## [x.y.z]` section to `CHANGELOG.md`, push `main`. CI publishes to npm (OIDC trusted publisher) and creates GitHub release `vX.Y.Z`.

## License

MIT
