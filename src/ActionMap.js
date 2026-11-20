import EventEmitter from 'events';

/**
 * Normalize a binding entry to { control, data }.
 * @param {string|{ control: string, data?: * }} entry
 */
function normalizeBinding (entry) {
    if (typeof entry === 'string') {
        return { control: entry, data: undefined };
    }
    return { control: entry.control, data: entry.data };
}

/**
 * Keyboard-ish control ids use event.code shape (KeyW, Space, ArrowUp, Digit1, …).
 * Gamepad ids are named (AButton, LeftStick, UpDPad, …).
 */
function isKeyboardControl (control) {
    return (
        control.startsWith('Key') ||
        control.startsWith('Arrow') ||
        control.startsWith('Digit') ||
        control.startsWith('Numpad') ||
        control === 'Space' ||
        control === 'Enter' ||
        control === 'Escape' ||
        control === 'Tab' ||
        control === 'Backspace' ||
        control === 'ShiftLeft' ||
        control === 'ShiftRight' ||
        control === 'ControlLeft' ||
        control === 'ControlRight' ||
        control === 'AltLeft' ||
        control === 'AltRight'
    );
}

/**
 * Map many physical controls onto named logical actions.
 *
 * @param {import('./Controller').default} controller
 * @param {Record<string, Array<string|{ control: string, data?: * }>>} bindings
 * @param {{
 *   enabled?: () => boolean,
 *   preventDefault?: boolean,
 *   autoTick?: boolean,
 * }} [options]
 */
class ActionMap extends EventEmitter {
    constructor (controller, bindings = {}, options = {}) {
        super();

        this.controller = controller;
        this.enabled = typeof options.enabled === 'function'
            ? options.enabled
            : () => true;
        this.preventDefault = options.preventDefault !== false;
        this.autoTick = options.autoTick !== false;

        /** @type {Map<string, Array<{ control: string, data?: * }>>} */
        this._bindings = new Map();
        /** control → [{ action, data }] */
        this._controlIndex = new Map();
        /** action → Set of currently held control ids */
        this._heldByAction = new Map();
        /** action → last event payload while held (for :held ticks) */
        this._lastEvent = new Map();
        this._listeners = [];
        this._disposed = false;
        this._wasEnabled = true;
        this._raf = 0;

        this._applyBindings(bindings);

        if (this.preventDefault) {
            this._onKeyDownCapture = (event) => {
                if (!this.enabled()) return;
                if (!this._keyboardCodes.has(event.code)) return;
                event.preventDefault();
            };
            window.addEventListener('keydown', this._onKeyDownCapture, true);
        }

        this._onBlur = () => {
            this.clearHeld();
        };
        window.addEventListener('blur', this._onBlur);

        if (this.autoTick) {
            const tick = () => {
                if (this._disposed) return;
                this._raf = requestAnimationFrame(tick);
                this._tick();
            };
            this._raf = requestAnimationFrame(tick);
        }
    }

    _applyBindings (bindings) {
        this._keyboardCodes = new Set();

        for (const [action, entries] of Object.entries(bindings)) {
            const list = (entries || []).map(normalizeBinding);
            this._bindings.set(action, list);
            this._heldByAction.set(action, new Set());

            for (const binding of list) {
                if (isKeyboardControl(binding.control)) {
                    this._keyboardCodes.add(binding.control);
                }
                let bucket = this._controlIndex.get(binding.control);
                if (!bucket) {
                    bucket = [];
                    this._controlIndex.set(binding.control, bucket);
                }
                bucket.push({ action, data: binding.data });

                const onPressed = (raw) => this._onPhysicalPressed(binding.control, raw);
                const onReleased = (raw) => this._onPhysicalReleased(binding.control, raw);

                this.controller.on(`${binding.control}:pressed`, onPressed);
                this.controller.on(`${binding.control}:released`, onReleased);
                this._listeners.push(
                    { event: `${binding.control}:pressed`, fn: onPressed },
                    { event: `${binding.control}:released`, fn: onReleased }
                );
            }
        }
    }

    _isEnabled () {
        const on = this.enabled();
        if (this._wasEnabled && !on) {
            this.clearHeld();
        }
        this._wasEnabled = on;
        return on;
    }

    _onPhysicalPressed (control, raw) {
        if (!this._isEnabled()) return;

        const targets = this._controlIndex.get(control);
        if (!targets) return;

        for (const { action, data } of targets) {
            const held = this._heldByAction.get(action);
            const wasEmpty = held.size === 0;
            held.add(control);

            const event = {
                action,
                control,
                data,
                device: raw?.device,
                raw
            };
            this._lastEvent.set(action, event);

            if (wasEmpty) {
                this.emit(`${action}:pressed`, event);
            }
            this.emit(action, event);
        }
    }

    _onPhysicalReleased (control, raw) {
        const targets = this._controlIndex.get(control);
        if (!targets) return;

        for (const { action, data } of targets) {
            const held = this._heldByAction.get(action);
            if (!held.has(control)) continue;
            held.delete(control);

            const event = {
                action,
                control,
                data,
                device: raw?.device,
                raw
            };

            if (held.size === 0) {
                this._lastEvent.delete(action);
                this.emit(`${action}:released`, event);
            } else {
                // Prefer another still-held binding's data for subsequent held ticks.
                const still = this._bindings.get(action) || [];
                for (const b of still) {
                    if (held.has(b.control)) {
                        this._lastEvent.set(action, {
                            action,
                            control: b.control,
                            data: b.data,
                            device: raw?.device,
                            raw
                        });
                        break;
                    }
                }
            }
        }
    }

    _tick () {
        if (!this._isEnabled()) return;
        for (const [action, held] of this._heldByAction) {
            if (held.size === 0) continue;
            const event = this._lastEvent.get(action);
            if (!event) continue;
            this.emit(`${action}:held`, event);
        }
    }

    /**
     * @param {string} action
     * @returns {boolean}
     */
    held (action) {
        const set = this._heldByAction.get(action);
        return Boolean(set && set.size > 0);
    }

    /**
     * Last event payload for a held action (control + data), or null.
     * @param {string} action
     */
    heldEvent (action) {
        if (!this.held(action)) return null;
        return this._lastEvent.get(action) || null;
    }

    /** Release all logical actions (emits :released once per previously held action). */
    clearHeld () {
        for (const [action, held] of this._heldByAction) {
            if (held.size === 0) continue;
            const last = this._lastEvent.get(action);
            held.clear();
            this._lastEvent.delete(action);
            this.emit(`${action}:released`, last || { action, control: null, data: undefined });
        }
    }

    dispose () {
        if (this._disposed) return;
        this._disposed = true;
        cancelAnimationFrame(this._raf);
        for (const { event, fn } of this._listeners) {
            this.controller.off(event, fn);
        }
        this._listeners.length = 0;
        if (this._onKeyDownCapture) {
            window.removeEventListener('keydown', this._onKeyDownCapture, true);
        }
        window.removeEventListener('blur', this._onBlur);
        this.removeAllListeners();
    }
}

export default ActionMap;
