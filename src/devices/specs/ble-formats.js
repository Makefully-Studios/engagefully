/* global TextDecoder */
export default [{
    description: "Reserved For Future Use",
    convert: (dataView) => dataView
}, {
    description: "Boolean",
    convert: (dataView) => dataView.getInt8()
}, {
    description: "unsigned 2-bit integer",
    convert: (dataView) => dataView.getUint8()
}, {
    description: "unsigned 4-bit integer",
    convert: (dataView) => dataView.getUint8()
}, {
    description: "unsigned 8-bit integer",
    convert: (dataView) => dataView.getUint8()
}, {
    description: "unsigned 12-bit integer",
    convert: (dataView) => dataView.getUint16()
}, {
    description: "unsigned 16-bit integer",
    convert: (dataView) => dataView.getUint16()
}, {
    description: "unsigned 24-bit integer",
    convert: (dataView) => dataView.getUint32()
}, {
    description: "unsigned 32-bit integer",
    convert: (dataView) => dataView.getUint32()
}, {
    description: "unsigned 48-bit integer",
    convert: (dataView) => dataView.getBigUint64()
}, {
    description: "unsigned 64-bit integer",
    convert: (dataView) => dataView.getBigUint64()
}, {
    description: "unsigned 128-bit integer",
    convert: (dataView) => [dataView.getBigUint64(), dataView.getBigUint64(8)]
}, {
    description: "signed 8-bit integer",
    convert: (dataView) => dataView.getInt8()
}, {
    description: "signed 12-bit integer",
    convert: (dataView) => dataView.getInt16()
}, {
    description: "signed 16-bit integer",
    convert: (dataView) => dataView.getInt16()
}, {
    description: "signed 24-bit integer",
    convert: (dataView) => dataView.getInt32()
}, {
    description: "signed 32-bit integer",
    convert: (dataView) => dataView.getInt32()
}, {
    description: "signed 48-bit integer",
    convert: (dataView) => dataView.getBigInt64()
}, {
    description: "signed 64-bit integer",
    convert: (dataView) => dataView.getBigInt64()
}, {
    description: "signed 128-bit integer",
    convert: (dataView) => [dataView.getBigInt64(), dataView.getBigInt64(8)]
}, {
    description: "IEEE-754 32-bit floating point",
    convert: (dataView) => dataView.getFloat32()
}, {
    description: "IEEE-754 64-bit floating point",
    convert: (dataView) => dataView.getFloat64()
}, {
    description: "IEEE-11073 16-bit SFLOAT",
    convert: (dataView) => dataView // TODO: Add conversion
}, {
    description: "IEEE-11073 32-bit FLOAT",
    convert: (dataView) => dataView // TODO: Add conversion
}, {
    description: "IEEE-20601 format",
    convert: (dataView) => dataView // TODO: Add conversion
}, {
    description: "UTF-8 string",
    convert: (dataView) => {
        const
            decoder = new TextDecoder('utf-8');

        return decoder.decode(dataView);
    }
}, {
    description: "UTF-16 string",
    convert: (dataView) => {
        const
            decoder = new TextDecoder('utf-16');

        return decoder.decode(dataView);
    }
}, {
    description: "Opaque Structure",
    convert: (dataView) => dataView
}];