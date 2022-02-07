import EventEmitter from 'events';

const
    clampVector = function (v, deadzone) {
        const
            x = v.x,
            y = v.y,
            m = Math.sqrt(x * x + y * y);

        if (m > 1) {
            v.x *= 1 / m;
            v.y *= 1 / m;
        } else if (m < deadzone) {
            v.x = 0;
            v.y = 0;
        } else {
            const
                span = 1 - deadzone;

            v.x = (x - deadzone) / span;
            v.y = (y - deadzone) / span;
        }

        return v;
    },
    updateGamepads = () => {
        const
            gamepads = [...window.navigator.getGamepads()];

        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];

            if (gamepad) {
                const standard = standardizedGamepads[gamepad.index];

                if (!standard) { // set up initial values so events can be triggered later
                    standardizedGamepads[gamepad.index] = new Gamepad(gamepad);
                } else {
                    standard.update(gamepad);
                }
            }
        }

        window.requestAnimationFrame(updateGamepads);
    },
    playEffectOptions = {
        duration: 500,
        startDelay: 0,
        strongMagnitude: 1.0,
        weakMagnitude: 1.0
    },
    controllers = {
        a0: 'LeftStick',
        a1: 'RightStick',
        b0: 'AButton',
        b1: 'BButton',
        b2: 'XButton',
        b3: 'YButton',
        b4: 'LeftBumper',
        b5: 'RightBumper',
        b6: 'LeftTrigger',
        b7: 'RightTrigger',
        b8: 'BackButton',
        b9: 'StartButton',
        b10: 'LeftStickButton',
        b11: 'RightStickButton',
        b12: 'UpDPad',
        b13: 'DownDPad',
        b14: 'LeftDPad',
        b15: 'RightDPad'
    },
    standardizedGamepads = [];

window.addEventListener("gamepadconnected", () => {
    updateGamepads();
});

class Gamepad extends EventEmitter {
    constructor (gamepad, id = '', deadzone = 0.1) {
        super();

        this.source = gamepad;
        this.deadzone = deadzone;
        this.axes = [];
        for (let i = 0; i < (gamepad.axes.length >> 1); i++) {
            this.axes.push(clampVector({
                x: gamepad.axes[i * 2],
                y: gamepad.axes[i * 2 + 1]
            }, deadzone));
        }
        this.buttons = [];
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this.buttons.push(gamepad.buttons[i].value);
        }
        this.id = id || `${gamepad.id} - ${gamepad.index}`; // Adding index to make it unique.
    }

    dualRumble (duration = 500, delay = 0, strong = 1.0, weak = 1.0) {
        playEffectOptions.duration = duration;
        playEffectOptions.startDelay = delay;
        playEffectOptions.strongMagnitude = strong;
        playEffectOptions.weakMagnitude = weak;
        this.source.vibrationActuator.playEffect('dual-rumble', playEffectOptions);
    }

    update (gamepad) {
        const
            axes = this.axes,
            buttons = this.buttons;

        for (let i = 0; i < axes.length; i++) {
            const
                oldVector = axes[i],
                newVector = clampVector({
                    x: gamepad.axes[i * 2],
                    y: gamepad.axes[i * 2 + 1]
                }, this.deadzone);

            if (oldVector.x !== newVector.x || oldVector.y !== newVector.y) {
                const
                    x = newVector.x,
                    y = newVector.y,
                    event = {
                        control: controllers[`a${i}`],
                        device: this.id,
                        type: 'Joystick',
                        x,
                        y
                    };

                oldVector.x = x;
                oldVector.y = y;

                this.emit('updated', event);
            }
        }
        
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const
                newButton = gamepad.buttons[i],
                newValue = newButton.value,
                oldButton = buttons[i];
            
            if (newValue !== oldButton) {
                const
                    event = {
                        control: controllers[`b${i}`],
                        device: this.id,
                        type: 'Button',
                        value: newValue
                    };

                buttons[i] = newValue;

                this.emit('updated', event);
            }
        }
    }
}

class GamepadDevice extends EventEmitter {
    constructor () {
        super();

        this.eventHandlers = [];

        window.addEventListener("gamepadconnected", () => {
            this.updateGamepads();
        });

        this.updateGamepads();
    }

    updateGamepads () {
        for (let i = 0; i < this.eventHandlers.length; i++) {
            this.eventHandlers[i].gamepad.off('updated', this.eventHandlers[i].handler);
        }
        this.eventHandlers.length = 0;

        for (let i = 0; i < standardizedGamepads.length; i++) {
            const
                handler = (event) => {
                    this.emit('updated', event);
                };

            standardizedGamepads[i].on('updated', handler);

            this.eventHandlers.push({
                gamepad: standardizedGamepads[i],
                handler
            })
        }
    }
};

export default GamepadDevice;