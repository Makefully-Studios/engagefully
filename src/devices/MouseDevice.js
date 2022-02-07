import EventEmitter from 'events';

class MouseDevice extends EventEmitter {
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
        });
    }
}

export default MouseDevice