import EventEmitter from 'events';
import controlMap from "./actions/index";

class Controller extends EventEmitter {
    constructor (devices = [], controlClasses = {}) {
        super();

        this.devices = [];
        this.controls = {};

        // Set up control map with type to class conversions
        this.controlMap = {
            ...controlMap,
            ...controlClasses
        };

        devices.forEach((device) => this.addDevice(device));
    }
    
    addControl (id, type) {
        const
            Control = this.controlMap[type];
    
        if (Control) {
            const
                control = this.controls[id] = new Control(id);

            return control;
        } else {
            console.warn(`${key}: "${type}" has no associated control class.`);
            return null;
        }
    }

    addDevice (device) {
        this.devices.push(device);

        device.on('updated', (event) => {
            const
                key = event.control;
            let control = this.controls[key];
            
            if (!control) {
                control = this.addControl(key, event.type);

                if (!control) {
                    return;
                }
            }

            control.update(event, this);
        });
    }

    getControl (id, type) {
        let control = this.controls[id];
            
        if (!control && type) {
            control = this.addControl(id, type);
        }

        return control;
    }

    poll (id) {
        return this.controls[id]?.poll?.();
    }
};

export default Controller;