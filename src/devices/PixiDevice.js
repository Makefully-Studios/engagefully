import EventEmitter from 'events';

class PixiDevice extends EventEmitter {
    constructor (target, device = 'PixiDevice') {
        super();

        this.pressed = 0;

        target.on('pointerdown', (event) => {
            this.pressed = 1;
            this.emit('updated', {
                control: 'Pointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.x,
                y: event.y
            });
        });
        target.on('pointermove', (event) => {
            this.emit('updated', {
                control: 'Pointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.x,
                y: event.y
            });
        });
        target.on(options?.up ?? 'pointerup', (event) => {
            this.pressed = 0;
            this.emit('updated', {
                control: 'Pointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.x,
                y: event.y
            });
        });
    }
}

export default PixiDevice;