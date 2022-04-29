/* global TextDecoder */
export default {
    "default": {
        convert: (dataView) => dataView
    },
    "00002901-0000-1000-8000-00805f9b34fb": {
        convert: (dataView) => new TextDecoder('utf-8').decode(dataView)
    },
    "00002904-0000-1000-8000-00805f9b34fb": {
        convert: (dataView) => dataView.getUint8()
    }
};