import EventEmitter from 'events';

class FabricDevice extends EventEmitter {
    constructor (target, device = 'FabricDevice') {
        super();

        this.pressed = 0;

        // FabricPointer
        target.on('mousedown', (event) => {
            this.pressed = 1;
            this.emit('updated', {
                control: 'FabricPointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.pointer.x,
                y: event.pointer.y
            });
        });

        target.on('mousemove', (event) => {
            this.emit('updated', {
                control: 'FabricPointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.pointer.x,
                y: event.pointer.y
            });
        });

        target.on('mouseup', (event) => {
            this.pressed = 0;
            this.emit('updated', {
                control: 'FabricPointer',
                device,
                event,
                target,
                type: 'Pointer',
                value: this.pressed,
                x: event.pointer.x,
                y: event.pointer.y
            });
        });

        // FabricDrop
        target.on('dropped', (event) => {
            this.emit('updated', {
                control: 'FabricDrop',
                device,
                event,
                target,
                type: 'Drop',
                value: event.dropZone ? event.dropZone.dropZone : '',
                x: event.dropZone ? event.dropZoneX : event.x,
                y: event.dropZone ? event.dropZoneY : event.y
            });

            event.stopPropagation();
        });

        // FabricDrag
        target.on('dragover', (event) => {
            this.emit('updated', {
                control: 'FabricDrag',
                device,
                event,
                target,
                type: 'Drop',
                value: event.dropZone ? event.dropZone.dropZone : '',
                x: event.dropZone ? event.dropZoneX : event.x,
                y: event.dropZone ? event.dropZoneY : event.y
            });

            event.stopPropagation();
        });

        // FabricDial
        target.on('rotating', (event) => {
            this.emit('updated', {
                control: 'FabricDial',
                device,
                event,
                target,
                type: 'Dial',
                value: target.angle / 360
            });
        });
    }
}

export default FabricDevice;