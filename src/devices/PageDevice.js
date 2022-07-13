import {BroadcastChannel} from 'broadcast-channel';
import EventEmitter from 'events';

class PageDevice extends EventEmitter {
    constructor (device = 'PageDevice') {
        super();
        this.channel = new BroadcastChannel(id);
        this.channel.addEventListener('message', (event) => {
            this.emit('updated', event);
        });
    }
};

export default PageDevice;