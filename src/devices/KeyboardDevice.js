import EventEmitter from 'events';

class KeyboardDevice extends EventEmitter {
    constructor (device = 'Keyboard') {
        super();

        window.addEventListener('keydown', (event) => {
            this.emit('updated', {
                control: event.code,
                device,
                event,
                type: 'Button',
                value: 1
            });
        });
        window.addEventListener('keyup', (event) => {
            this.emit('updated', {
                control: event.code,
                device,
                event,
                type: 'Button',
                value: 0
            });
        });
    }
}

export default KeyboardDevice;