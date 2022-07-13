import {BroadcastChannel} from 'broadcast-channel';

class PageAction {
    constructor (controllerOrDeviceList, id = 'PageDevice') {
        const
            devices = controllerOrDeviceList.devices || controllerOrDeviceList;

        this.channel = new BroadcastChannel(id);

        devices.forEach((device) => {
            device.on('updated', (event) => {
                const
                    newEvent = {
                        ...event
                    };

                newEvent.device = `${id}-${event.device}`;
                newEvent.control = `Page${event.control}`;

                // These aren't necessarily serializable.
                delete newEvent.target;
                delete newEvent.event;

                this.channel.postMessage(newEvent);
            });
        });
    }
}

export default PageAction;