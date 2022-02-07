import EventEmitter from 'events';

class KeyboardDevice extends EventEmitter {
    constructor () {
        super();

        this.message = {
            control: '',
            device: 'Keyboard',
            type: 'Button',
            value: 0
        }

        window.addEventListener('keydown', (event) => {
            const
                msg = this.message;

            msg.control = event.code;
            msg.value = 1;

            this.emit('updated', msg);
        });
        window.addEventListener('keyup', (event) => {
            const
                msg = this.message;

            msg.control = event.code;
            msg.value = 0;

            this.emit('updated', msg);
        });
    }

    toJSON () {
        return this.message;
    }
}

export default KeyboardDevice;