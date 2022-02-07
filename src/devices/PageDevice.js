import {BroadcastChannel} from 'broadcast-channel';
import EventEmitter from 'events';

class PageDevice extends EventEmitter {
    constructor (id = 'page') {
        super();
        this.controls = {};
        this.channel = new BroadcastChannel(id);
        this.channel.addEventListener('message', (event) => {
            const
                lastValue = this.controls[event.control];

            this.controls[event.control] = event.value;
            this.emit('updated', event, lastValue);
        });
    }
};

export default PageDevice;