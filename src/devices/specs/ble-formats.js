/* global TextDecoder */
export default [{ // 0x0
    description: "Reserved For Future Use",
    convert: (dataView) => dataView.byteLength ? dataView : null
}, { // 0x1
    description: "Boolean",
    convert: (dataView) => dataView.getInt8()
}, { // 0x2
    description: "unsigned 2-bit integer",
    convert: (dataView) => dataView.getUint8()
}, { // 0x3
    description: "unsigned 4-bit integer",
    convert: (dataView) => dataView.getUint8()
}, { // 0x4
    description: "unsigned 8-bit integer",
    convert: (dataView) => dataView.getUint8()
}, { // 0x5
    description: "unsigned 12-bit integer",
    convert: (dataView) => dataView.getUint16()
}, { // 0x6
    description: "unsigned 16-bit integer",
    convert: (dataView) => dataView.getUint16()
}, { // 0x7
    description: "unsigned 24-bit integer",
    convert: (dataView) => dataView.getUint32()
}, { // 0x8
    description: "unsigned 32-bit integer",
    convert: (dataView) => dataView.getUint32()
}, { // 0x9
    description: "unsigned 48-bit integer",
    convert: (dataView) => dataView.getBigUint64()
}, { // 0xA
    description: "unsigned 64-bit integer",
    convert: (dataView) => dataView.getBigUint64()
}, { // 0xB
    description: "unsigned 128-bit integer",
    convert: (dataView) => [dataView.getBigUint64(), dataView.getBigUint64(8)]
}, { // 0xC
    description: "signed 8-bit integer",
    convert: (dataView) => dataView.getInt8()
}, { // 0xD
    description: "signed 12-bit integer",
    convert: (dataView) => dataView.getInt16()
}, { // 0xE
    description: "signed 16-bit integer",
    convert: (dataView) => dataView.getInt16()
}, { // 0xF
    description: "signed 24-bit integer",
    convert: (dataView) => dataView.getInt32()
}, { // 0x10
    description: "signed 32-bit integer",
    convert: (dataView) => dataView.getInt32()
}, { // 0x11
    description: "signed 48-bit integer",
    convert: (dataView) => dataView.getBigInt64()
}, { // 0x12
    description: "signed 64-bit integer",
    convert: (dataView) => dataView.getBigInt64()
}, { // 0x13
    description: "signed 128-bit integer",
    convert: (dataView) => [dataView.getBigInt64(), dataView.getBigInt64(8)]
}, { // 0x14
    description: "IEEE-754 32-bit floating point",
    convert: (dataView) => dataView.getFloat32()
}, { // 0x15
    description: "IEEE-754 64-bit floating point",
    convert: (dataView) => dataView.getFloat64()
}, { // 0x16
    description: "IEEE-11073 16-bit SFLOAT",
    convert: (dataView) => dataView // TODO: Add conversion
}, { // 0x17
    description: "IEEE-11073 32-bit FLOAT",
    convert: (dataView) => dataView // TODO: Add conversion
}, { // 0x18
    description: "IEEE-20601 format",
    convert: (dataView) => dataView // TODO: Add conversion
}, { // 0x19
    description: "UTF-8 string",
    convert: (dataView) => {
        const
            decoder = new TextDecoder('utf-8');

        return decoder.decode(dataView);
    }
}, { // 0x1A
    description: "UTF-16 string",
    convert: (dataView) => {
        const
            decoder = new TextDecoder('utf-16');

        return decoder.decode(dataView);
    }
}, { // 0x1B
    description: "Opaque Structure",
    convert: (dataView) => dataView
}];