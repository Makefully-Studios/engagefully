import EventEmitter from 'events';

class PointerDevice extends EventEmitter {
    constructor (target) {
        super();

        this.message = {
            type: 'Pointer',
            id: target.id || 'pointer',
            value: 0,
            x: 0,
            y: 0
        }

        target.addEventListener('pointerdown', (event) => {
            const
                msg = this.message;

            msg.value = 1;
            msg.x = event.x ?? event.pointer?.x;
            msg.y = event.y ?? event.pointer?.y;

            this.emit('updated', msg);
        });
        target.addEventListener('pointermove', (event) => {
            const
                msg = this.message;

            msg.x = event.x ?? event.pointer?.x;
            msg.y = event.y ?? event.pointer?.y;

            this.emit('updated', msg);
        });
        target.addEventListener('pointerup', (event) => {
            const
                msg = this.message;

            msg.value = 0;
            msg.x = event.x ?? event.pointer?.x;
            msg.y = event.y ?? event.pointer?.y;

            this.emit('updated', msg);
        });
    }

    toJSON () {
        return msg;
    }
}

export default PointerDevice;