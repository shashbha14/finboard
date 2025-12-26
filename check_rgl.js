const RGL = require('react-grid-layout');
console.log('RGL:', RGL);
console.log('RGL keys:', Object.keys(RGL));
if (RGL.default) {
    console.log('RGL.default keys:', Object.keys(RGL.default));
}

try {
    const WidthProvider = require('react-grid-layout').WidthProvider;
    console.log('Direct destructure:', !!WidthProvider);
} catch (e) { }
