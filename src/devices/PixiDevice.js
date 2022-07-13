import EventEmitter from 'events';

class PixiDevice extends EventEmitter {
    constructor (optionsOrTarget) {
        super();

        const
            options = optionsOrTarget.target ? optionsOrTarget : null,
            target = this.target = optionsOrTarget.target ?? optionsOrTarget,
            aEL = target.on ? 'on' : 'addEventListener';

        this.message = {
            type: 'Pointer',
            id: target.id || options.id || 'pointer',
            value: 0,
            x: 0,
            y: 0
        }

        target[aEL](options?.down ?? 'pointerdown', (event) => {
            const
                msg = this.message;

            msg.value = 1;
            msg.x = event.x;
            msg.y = event.y;

            this.emit('updated', msg);
        });
        target[aEL](options?.move ?? 'pointermove', (event) => {
            const
                msg = this.message;

            msg.x = event.x;
            msg.y = event.y;

            this.emit('updated', msg);
        });
        target[aEL](options?.up ?? 'pointerup', (event) => {
            const
                msg = this.message;

            msg.value = 0;
            msg.x = event.x;
            msg.y = event.y;

            this.emit('updated', msg);
        });
    }
}

export default PixiDevice;