import EventEmitter from 'events';

class FabricDevice extends EventEmitter {
    constructor (target, device = 'FabricDevice') {
        super();

        // FabricPointer
        this.msgFabricPointer = {
            control: 'FabricPointer',
            device,
            type: 'Pointer',
            value: 0,
            x: 0,
            y: 0
        };

        target.on('mousedown', (event) => {
            const
                msg = this.msgFabricPointer;

            msg.value = 1;
            msg.x = event.pointer.x;
            msg.y = event.pointer.y;

            this.emit('updated', msg);
        });
        target.on('mousemove', (event) => {
            const
                msg = this.msgFabricPointer;

            msg.x = event.pointer.x;
            msg.y = event.pointer.y;

            this.emit('updated', msg);
        });
        target.on('mouseup', (event) => {
            const
                msg = this.msgFabricPointer;

            msg.value = 0;
            msg.x = event.pointer.x;
            msg.y = event.pointer.y;

            this.emit('updated', msg);
        });

        // FabricDrop
        this.msgFabricDrop = {
            control: 'FabricDrop',
            device,
            type: 'Drop',
            value: '',
            x: 0,
            y: 0
        };

        target.on('dropped', (event) => {
            const
                msg = this.msgFabricDrop;

            if (event.dropZone) {
                msg.value = event.dropZone.dropZone;
                msg.x = event.dropZoneX;
                msg.y = event.dropZoneY;
            } else {
                msg.value = '';
                msg.x = event.x;
                msg.y = event.y;
            }

            this.emit('updated', msg);

            event.stopPropagation();
        });

        // FabricDrag
        this.msgFabricDrag = {
            control: 'FabricDrag',
            device,
            type: 'Drop',
            value: '',
            x: 0,
            y: 0
        };

        target.on('dragover', (event) => {
            const
                msg = this.msgFabricDrag;

            if (event.dropZone) {
                msg.value = event.dropZone.dropZone;
                msg.x = event.dropZoneX;
                msg.y = event.dropZoneY;
            } else {
                msg.value = '';
                msg.x = event.x;
                msg.y = event.y;
            }

            this.emit('updated', msg);

            event.stopPropagation();
        });

        // FabricDial
        this.msgFabricDial = {
            control: 'FabricDial',
            device,
            type: 'Dial',
            value: 0
        };

        target.on('rotating', (event) => {
            const
                msg = this.msgFabricDial;

            msg.value = target.angle / 360;

            this.emit('updated', msg);
        });
    }

    toJSON () {
        return msg;
    }
}

export default FabricDevice;