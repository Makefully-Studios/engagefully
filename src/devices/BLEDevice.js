/* global BluetoothUUID, console, navigator */
import BLECharacteristics from './specs/ble-characteristics.json';
import BLEFormats from './specs/ble-formats';
import EventEmitter from 'events';

class BLEDevice extends EventEmitter {
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

                        descriptors.forEach(async (value) => {
                            const
                                byte = (await value.readValue()).getUint8();

                            if (value.uuid === presentationFormat) {
                                format = BLEFormats[byte] || BLEFormats[0];
                            }
                            console.log(`${value.uuid} | ${friendlyName}`, byte);
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

export default BLEDevice;
