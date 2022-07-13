import {BroadcastChannel} from 'broadcast-channel';
import EventEmitter from 'events';

class PageDevice extends EventEmitter {
    constructor (device = 'PageDevice') {
        super();
        this.channel = new BroadcastChannel(device);
        this.channel.addEventListener('message', (event) => {
            this.emit('updated', event);
        });
    }
};

export default PageDevice;