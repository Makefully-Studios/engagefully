/* global console, navigator */
import BLECharacteristics from './specs/ble-characteristics.json';
import BLEDescriptors from './specs/ble-descriptors';
import BLEFormats from './specs/ble-formats';
import EventEmitter from 'events';

const
    getDescriptorValue = (uuid, characteristic) => {
        const
            descriptors = characteristic?.descriptors;

        if (descriptors) {
            const
                descriptor = descriptors.find((value) => value.uuid === uuid);

            if (descriptor) {
                return descriptor.value;
            }
        }

        return null;
    },
    getCharacteristicUserDescription = (characteristic) => {
        if (typeof characteristic === 'string') {
            return characteristic;
        } else {
            return getDescriptorValue('2901', characteristic) || getDescriptorValue('00002904-0000-1000-8000-00805f9b34fb', characteristic);
        }
    },
    getCharacteristicPresentationFormat = getDescriptorValue.bind(null, "2904"),
    getControllerType = ({description}, customType = 'CustomType') => {
        switch (description) {
        case 'Reserved For Future Use':
            return customType;
        case 'Boolean':
            return 'Button';
        case 'UTF-8 string':
        case 'UTF-16 string':
            return 'Text';
        case 'Opaque Structure':
            return customType;
        default:
            return 'Amount'
        }
    };

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

        this.writes = {};

        if (bluetoothDeviceOrOptions?.id) { // It's a Bluetooth device
            this.device = bluetoothDeviceOrOptions;
            this.options = null;
        } else {
            this.device = null;
            this.options = bluetoothDeviceOrOptions;
        }
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
                characteristics = device.characteristics;

            this.device = device;
                
            characteristics.forEach(async (characteristic) => {
                const
                    properties = characteristic.properties,
                    characteristicUUID = characteristic.characteristic.toLowerCase(), // iOS uses uppercase UUID's
                    characteristicDescription = this.uuidMap[characteristicUUID],
                    friendlyName = getCharacteristicUserDescription(characteristicDescription) || characteristicUUID,
                    descriptors = characteristic.descriptors || [],
                    format = BLEFormats[getCharacteristicPresentationFormat(characteristicDescription) || 0x1B]; // Assume "Opaque Structure" unless otherwise specified.

                console.log(friendlyName, characteristic);

                descriptors.forEach((descriptor) => {
                    console.log(`${descriptor.uuid} | ${friendlyName}`, descriptor);
                });

                if (properties.indexOf('Read') >= 0) {

                }

                if (properties.indexOf('Write') >= 0) {
                    if (this.writes[friendlyName]) {
                        throw new Error(`There is already a writable characteristic named "${friendlyName}".`)
                    }

                    this.writes[friendlyName] = (data) => {
                        return this.ble.withPromises.write(device.id, characteristic.service, characteristic.characteristic, data.buffer ?? data);
                    };
                }

                if (properties.indexOf('Notify') >= 0) {
                    const
                        type = getControllerType(format, friendlyName);
                    let lastValue = null;

                    this.ble.startNotification(device.id, characteristic.service, characteristic.characteristic, (buffer, index) => {
                        const
                            newValue = format.convert(new DataView(buffer));

                        if (lastValue !== newValue) {
                            lastValue = newValue;
                            this.emit('updated', {
                                control: friendlyName,
                                device: this.deviceName,
                                type,
                                value: newValue
                            });
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
            if (cordova.platformId !== 'ios') {
                this.ble.isLocationEnabled(() => {
                    console.log('Location is enabled');
                }, () => {
                    console.log('Location is disabled');
                });
            }
            this.ble.startScan((cordova.platformId === 'ios') ? options?.optionalServices ?? [] : [], (device) => { // TODO: Make possible to select from list instead of grabbing first one.
                const services = options?.optionalServices ?? [];
                let foundMatch = null;

                console.log('Found', device);

                if (cordova.platformId === 'ios') {
                    foundMatch = device;
                } else {
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
                        target: device,
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
                    this.writes = {};
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

    write (characteristicId, data) {
        if (!this.writes[characteristicId]) {
            throw new Error(`No writable characteristic "${characteristicId}".`);
        }

        return this.writes[characteristicId](data);
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

        this.writes = {};

        if (bluetoothDeviceOrOptions?.gatt) { // It's a Bluetooth device
            this.device = bluetoothDeviceOrOptions;
            this.options = null;
        } else {
            this.device = null;
            this.options = bluetoothDeviceOrOptions;
        }
    }

    async initialize (options) {
        const
            deviceAlreadySelected = !!this.device;

        if (!deviceAlreadySelected) {
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
            this.writes = {};
        });
    
        try {
            if (await this.connect()) {
                const
                    gatt = this.device.gatt,
                    services = await gatt.getPrimaryServices(),
                    presentationFormat = '00002904-0000-1000-8000-00805f9b34fb';

                services.forEach(async (service) => {
                    const
                        characteristics = await service.getCharacteristics();
                    
                    characteristics.forEach(async (characteristic) => {
                        const
                            properties = characteristic.properties,
                            characteristicDescription = this.uuidMap[characteristic.uuid],
                            friendlyName = getCharacteristicUserDescription(characteristicDescription) || characteristic.uuid;
                        let format = BLEFormats[0x1B]; // Assume "Opaque Structure" unless otherwise specified.

                        console.log(friendlyName, characteristic);

                        try {
                            const
                                descriptors = await characteristic.getDescriptors();
                            let formatFound = false;

                            descriptors.forEach(async (descriptor) => {
                                try {
                                    const
                                        value = (BLEDescriptors[descriptor.uuid] ?? BLEDescriptors['default']).convert(await descriptor.readValue());

                                    if (descriptor.uuid === presentationFormat) {
                                        format = BLEFormats[value] || BLEFormats[0];
                                        formatFound = true;
                                    }

                                    console.log(`${descriptor.uuid} | ${friendlyName}`, value);
                                } catch (e) {
                                    console.warn(`Error converting data from descriptor "${descriptor.uuid}".`, e);
                                }
                            });

                            if (!formatFound) {
                                const
                                    localDefinition = getCharacteristicPresentationFormat(characteristicDescription);

                                if (localDefinition) {
                                    format = BLEFormats[localDefinition];
                                }
                            }
                        } catch (e) {
                        }

                        if (properties.read) {

                        }

                        if (properties.write) {
                            if (this.writes[friendlyName]) {
                                throw new Error(`There is already a writable characteristic named "${friendlyName}".`)
                            }

                            this.writes[friendlyName] = (data) => {
                                const
                                    dv = (data instanceof DataView) ? data : new DataView(data.buffer ?? data);

                                return characteristic.writeValueWithResponse(dv);
                            };
                        }

                        if (properties.notify) {
                            const
                                listener = (event) => {
                                    const
                                        target = event.currentTarget,
                                        newValue = format.convert(target.value);

                                    if (lastValue !== newValue) {
                                        lastValue = newValue;
                                        this.emit('updated', {
                                            control: friendlyName,
                                            device: this.deviceName,
                                            type,
                                            value: newValue
                                        });
                                    }
                                },
                                type = getControllerType(format, friendlyName);
                            let lastValue = null;

                            await characteristic.startNotifications();
                            characteristic.addEventListener('characteristicvaluechanged', listener);
                        }
                    });
                });
            } else {
                throw "Not able to connect to device.";
            }
        } catch (e) {
            if (!deviceAlreadySelected) { // We'll try anew next time.
                if (this.device?.gatt?.connected) {
                    this.device.gatt.disconnect();
                }
                this.device = null;
            }
            throw e;
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
                    target: this.device,
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
        if (this.device?.gatt?.connected) {
            return this.device.gatt.disconnect();
        } else {
            throw 'Device not connected.';
        }
    }

    write (characteristicId, data) {
        if (!this.writes[characteristicId]) {
            throw new Error(`No writable characteristic "${characteristicId}".`);
        }

        return this.writes[characteristicId](data);
    }
}

export default ble ? CordovaBLEDevice : WebkitBLEDevice;
