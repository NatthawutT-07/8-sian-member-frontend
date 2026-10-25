import assert from 'node:assert/strict';
import JsBarcode from 'jsbarcode';
const target = {};
JsBarcode(target, '88012345678901234567890123456789', { format: 'CODE128C', displayValue: true });
assert.ok(target.encodings.length > 0);
assert.match(target.encodings[0].data, /^[01]+$/);
assert.equal(target.encodings[0].text, '88012345678901234567890123456789');
console.log('PASS: 32-digit coupon payload encodes as CODE128-C');
