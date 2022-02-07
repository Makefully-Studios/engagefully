import {BroadcastChannel} from 'broadcast-channel';

class PageAction {
    constructor (controllerOrDeviceList, id = 'page') {
        const
            devices = controllerOrDeviceList.devices || controllerOrDeviceList;

        this.channel = new BroadcastChannel(id);

        devices.forEach((device) => {
            device.on('updated', (event) => {
                const
                    newEvent = {};

                for (const key in event) {
                    newEvent[key] = event[key];
                }

                newEvent.device = `${id}-${event.device}`;
                newEvent.control = `Page${event.control}`;

                this.channel.postMessage(newEvent);
            });
        });
    }
}

export default PageAction;