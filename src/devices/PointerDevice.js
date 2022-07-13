import EventEmitter from 'events';

class PointerDevice extends EventEmitter {
    constructor (target, device = 'PointerDevice') {
        super();

        this.pressed = 0;

        target.addEventListener('pointerdown', (event) => {
            this.pressed = 1;
            this.emit('updated', {
                control: 'Pointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.x ?? event.pointer?.x,
                y: event.y ?? event.pointer?.y
            });
        });
        target.addEventListener('pointermove', (event) => {
            this.emit('updated', {
                control: 'Pointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.x ?? event.pointer?.x,
                y: event.y ?? event.pointer?.y
            });
        });
        target.addEventListener('pointerup', (event) => {
            this.pressed = 0;
            this.emit('updated', {
                control: 'Pointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.x ?? event.pointer?.x,
                y: event.y ?? event.pointer?.y
            });
        });
    }
}

export default PointerDevice;