# Engagefully

**Engagefully** by [Makefully](https://makefullystudios.com) turns keyboard, gamepad, pointer, and other devices into a single controller of typed actions (Button, Joystick, Pointer, …).

> Early `0.x` API — expect breaking changes.

## Install

```bash
npm install @makefully/engagefully
```

Bundlers (Vite, etc.) may need the Node `events` polyfill — it is declared as a dependency of this package.

## Quickstart

```js
import { Controller, devices } from '@makefully/engagefully';

const controller = new Controller([
  new devices.KeyboardDevice(),
  new devices.GamepadDevice(),
]);

controller.on('KeyW:pressed', () => {
  /* move forward */
});

controller.on('AButton:pressed', () => {
  /* primary action */
});

// Poll each frame if you prefer state over events:
const held = controller.poll('Space'); // 0 | 1
const stick = controller.getControl('LeftStick', 'Joystick');
```

Physical control ids match the device:

| Device | Examples |
|--------|----------|
| Keyboard | `KeyW`, `Space`, `ArrowUp` (`event.code`) |
| Gamepad | `AButton`, `BButton`, `XButton`, `YButton`, `LeftStick`, `UpDPad`, … |
| Pointer | `Pointer` |

## Devices

**First-class:** `KeyboardDevice`, `GamepadDevice`, `PointerDevice`

**Also included (experimental):** `BLEDevice`, `FabricDevice`, `PixiDevice`, `PageDevice`

## Publishing

Bump `package.json` `version`, add a `## [x.y.z]` section to `CHANGELOG.md`, push `main`. CI publishes to npm (OIDC trusted publisher) and creates GitHub release `vX.Y.Z`.

## License

MIT
