/* global BluetoothUUID, console, navigator */
import BLECharacteristics from './specs/ble-characteristics.json';
import BLEDescriptors from './specs/ble-descriptors';
import BLEFormats from './specs/ble-formats';
import EventEmitter from 'events';

let ble = null,
    cordova = null;

try { // Put these in a try-catch so if we're in a cross-domain iframe, nothing breaks.
    ble = window.ble || window.top.ble
    cordova = window.cordova || window.top.cordova;
} catch (e) {}

class CordovaBLEDevice extends EventEmitter {
    constructor (bluetoothDeviceOrOptions = {acceptAllDevices: true}, deviceName = 'BLEDevice', uuidMap = {}) {
        super();

        this.deviceName = deviceName;
        this.uuidMap = {
            ...BLECharacteristics,
            ...uuidMap
        };
        this.ble = window.ble ?? window.top.ble;

        if (bluetoothDeviceOrOptions?.id) { // It's a Bluetooth device
            this.device = bluetoothDeviceOrOptions;
            this.options = null;
        } else {
            this.device = null;
            this.options = bluetoothDeviceOrOptions;
        }

        //this.initialize();
    }

    async initialize (options) {
        if (!this.device) {
            this.device = await this.requestDevice(options || this.options);
            if (!this.device) {
                throw "No device selected.";
            }
        }

        const device = await this.connect();

        if (device) {
            const
                services = device.services,
                presentationFormat = BluetoothUUID.getDescriptor('gatt.characteristic_presentation_format'),
                characteristics = device.characteristics;

            this.device = device;
                
            characteristics.forEach(async (characteristic) => {
                const
                    properties = characteristic.properties,
                    friendlyName = this.uuidMap[characteristic.characteristic] || characteristic.characteristic,
                    descriptors = characteristic.descriptors || [];
                let format = BLEFormats[14]; // Assume signed Int 16 unless otherwise specified.

                console.log(friendlyName, characteristic);

                descriptors.forEach((descriptor) => {
                    const
                        value = (BLEDescriptors[descriptor.uuid] ?? BLEDescriptors['default']).convert(descriptor.value);

                    if (descriptor.uuid === presentationFormat) {
                        format = BLEFormats[value] || BLEFormats[0];
                    }
                    console.log(`${descriptor.uuid} | ${friendlyName}`, value);
                });

                if (properties.indexOf('Read') >= 0) {

                }

                if (properties.indexOf('Write') >= 0) {

                }

                if (properties.indexOf('Notify') >= 0) {
                    const
                        type = format.description === 'Boolean' ? 'Button' : 'Amount',
                        msg = {
                            control: friendlyName,
                            device: this.deviceName,
                            type,
                            value: 0
                        };
                    let lastValue = null;

                    this.ble.startNotification(device.id, characteristic.service, characteristic.characteristic, (buffer) => {
                        const
                            newValue = format.convert(new DataView(buffer));

                        console.log(`${friendlyName} value changed.`, newValue);
                        if (lastValue !== newValue) {
                            msg.value = lastValue = newValue;
                            this.emit('updated', msg);
                        }
                    }, (err) => {
                        throw err;
                    });
                }
            });
        }
    }

    requestDevice (options) {
        console.log('Requesting Device...');
        return new Promise((resolve, reject) => {
            console.log('Starting Scan... ');
            this.ble.isLocationEnabled(() => {
                console.log('YES');
            }, () => {
                console.log('NO');
            });
            this.ble.startScan([], (device) => { // TODO: Make possible to select from list instead of grabbing first one.
                const services = options?.optionalServices ?? [];
                let foundMatch = null;

                console.log('Found', device);

                if (cordova.platformId !== 'ios') {
                    const
                        a = new Uint8Array(device.advertising),
                        str = Array.prototype.map.call(a, (x) => ('00' + x.toString(16)).slice(-2)).join('');

                    console.log(str.match(/[a-fA-F0-9]{4}/g).join('-'));

                    services.forEach((value) => {
                        const
                            id = value.replace(/\-/g, '');

                        if (str.match(/[a-fA-F0-9]{2}/g).reverse().join('').indexOf(id) >= 0) {
                            foundMatch = device;
                            console.log(`Found a match! ${value}`);
                        }
                    });
                }

                if (foundMatch) {
                    this.ble.stopScan();
                    resolve(foundMatch);
                }
            }, (err) => {
                console.log('Error', err);
                this.ble.stopScan();
                reject(err);
            });
        });
    } 
      
    connect () {
        return new Promise((resolve, reject) => {
            if (!this.device) {
                reject();
                throw 'No device selected.';
            } else {
                this.ble.connect(this.device.id, (device) => {
                    this.emit('updated', {
                        control: `${this.deviceName}Connection`,
                        device: this.deviceName,
                        type: 'Button',
                        value: 1
                    });
                    resolve(device);
                }, () => {
                    console.log(`${this.deviceName} disconnected.`);
                    this.emit('updated', {
                        control: `${this.deviceName}Connection`,
                        device: this.deviceName,
                        type: 'Button',
                        value: 0
                    });
                });
            }
        });
    }

    disconnect () {
        this.ble.isConnected(this.device.id, () => {
            this.ble.disconnect(this.device.id);
        }, () => {
            throw 'Device not connected.';
        });
    }
}

class WebkitBLEDevice extends EventEmitter {
    constructor (bluetoothDeviceOrOptions = {acceptAllDevices: true}, deviceName = 'BLEDevice', uuidMap = {}) {
        super();

        this.deviceName = deviceName;
        this.uuidMap = {
            ...BLECharacteristics,
            ...uuidMap
        };

        if (bluetoothDeviceOrOptions?.gatt) { // It's a Bluetooth device
            this.device = bluetoothDeviceOrOptions;
            this.options = null;
            this.initialize();
        } else {
            this.device = null;
            this.options = bluetoothDeviceOrOptions;
            try {
                this.initialize();
            } catch (e) {
                // we'll need to try later via user interaction.
            }
        }
    }

    async initialize (options) {
        if (!this.device) {
            this.device = await navigator.bluetooth.requestDevice(options || this.options);
            if (!this.device) {
                throw "No device selected.";
            }
        }

        this.device.addEventListener('gattserverdisconnected', () => {
            console.log(`${this.deviceName} disconnected.`);
            this.emit('updated', {
                control: `${this.deviceName}Connection`,
                device: this.deviceName,
                type: 'Button',
                value: 0
            });
        });

        if (await this.connect()) {
            const
                gatt = this.device.gatt,
                services = await gatt.getPrimaryServices(),
                presentationFormat = BluetoothUUID.getDescriptor('gatt.characteristic_presentation_format');

            services.forEach(async (service) => {
                const
                    characteristics = await service.getCharacteristics();
                
                characteristics.forEach(async (characteristic) => {
                    const
                        properties = characteristic.properties,
                        friendlyName = this.uuidMap[characteristic.uuid] || characteristic.uuid;
                    let format = BLEFormats[14]; // Assume signed Int 16 unless otherwise specified.

                    console.log(friendlyName, characteristic);

                    try {
                        const
                            descriptors = await characteristic.getDescriptors();

                        descriptors.forEach(async (descriptor) => {
                            const
                                value = (BLEDescriptors[descriptor.uuid] ?? BLEDescriptors['default']).convert(await descriptor.readValue());

                            if (descriptor.uuid === presentationFormat) {
                                format = BLEFormats[value] || BLEFormats[0];
                            }
                            console.log(`${descriptor.uuid} | ${friendlyName}`, value);
                        });
                    } catch (e) {
                    }

                    if (properties.read) {

                    }

                    if (properties.write) {

                    }

                    if (properties.notify) {
                        const
                            listener = (event) => {
                                const
                                    target = event.currentTarget,
                                    newValue = format.convert(target.value);

                                console.log(`${friendlyName} value changed.`, newValue);
                                if (lastValue !== newValue) {
                                    msg.value = lastValue = newValue;
                                    this.emit('updated', msg);
                                }
                            },
                            type = format.description === 'Boolean' ? 'Button' : 'Amount',
                            msg = {
                                control: friendlyName,
                                device: this.deviceName,
                                type,
                                value: 0
                            };
                        let lastValue = null;

                        await characteristic.startNotifications();
                        characteristic.addEventListener('characteristicvaluechanged', listener);
                    }
                });
            });
        }
    }
      
    async connect () {
        if (!this.device) {
            throw 'No device selected.';
        } else {
            const
                gatt = this.device.gatt;
            
            await gatt.connect();

            if (gatt.connected) {
                this.emit('updated', {
                    control: `${this.deviceName}Connection`,
                    device: this.deviceName,
                    type: 'Button',
                    value: 1
                });
                return true;
            } else {
                return false;
            }
        }
    }

    disconnect () {
        if (this.device?.gatt.connected) {
            return this.device.gatt.disconnect();
        } else {
            throw 'Device not connected.';
        }
    }
}

export default ble ? CordovaBLEDevice : WebkitBLEDevice;
