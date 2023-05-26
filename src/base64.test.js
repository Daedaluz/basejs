import {Base64, calcDecodedLength, calcEncodedLength} from "./base64.js";

const arrayEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

test('calculateEncodedLength', () => {
    [[1, 4], [2, 4], [3, 4], [4, 8]].forEach(([input, expected]) => {
        const res = calcEncodedLength(input, '=');
        if (res !== expected) throw new Error(`Expected ${expected}, got ${res} (Padded)`);
    });
    [[1, 2], [2, 3], [3, 4], [4, 6], [5, 7]].forEach(([input, expected]) => {
        const res = calcEncodedLength(input, '');
        if (res !== expected) throw new Error(`Expected ${expected}, got ${res} (Not padded)`);
    });
});

test('calculateDecodedLength', () => {
    [[1, 3], [2, 3], [3, 3], [4, 3], [5, 6]].forEach(([input, expected]) => {
        const res = calcDecodedLength(input, '=');
        if (res !== expected) throw new Error(`Expected ${expected}, got ${res} (Padded)`);
    });
});

test('encode', () => {
    if (Base64.encode(new Uint8Array([0xFF, 0xFF, 0xA0])) !== '//+g') throw new Error('Failed to encode 0xFF, 0xFF, 0xA0');

    [['Hello World!ö', 'SGVsbG8gV29ybGQhw7Y='], ['Hello World', 'SGVsbG8gV29ybGQ=']].forEach(([input, expected]) => {
        const res = Base64.encode(input);
        if (res !== expected) throw new Error(`Expected ${expected}, got ${res}`);
    });

    [['Hello World!ö', 'SGVsbG8gV29ybGQhw7Y'], ['Hello World', 'SGVsbG8gV29ybGQ']].forEach(([input, expected]) => {
        const res = Base64.encode(input, '');
        if (res !== expected) throw new Error(`Expected ${expected}, got ${res}`);
    });
});


test('decode', () => {
    [["SGVsbG8gV29ybGQhw7Y=", "Hello World!ö"], ["SGVsbG8gV29ybGQ=", "Hello World"]].forEach(([input, expected]) => {
        const res = Base64.decode(input);
        if (new TextDecoder().decode(res) !== expected) throw new Error(`Expected ${expected}, got ${res} (Padded)`);
    });
    [["SGVsbG8gV29ybGQhw7Y", "Hello World!ö"], ["SGVsbG8gV29ybGQ", "Hello World"]].forEach(([input, expected]) => {
        const res = Base64.decode(input);
        if (new TextDecoder().decode(res) !== expected) throw new Error(`Expected ${expected}, got ${res} (Not padded)`);
    });
    [["SGVsbG8gV29ybGQhw7Y==============", "Hello World!ö"], ["SGVsbG8gV29ybGQ=======", "Hello World"]].forEach(([input, expected]) => {
        const res = Base64.decode(input);
        if (new TextDecoder().decode(res) !== expected) throw new Error(`Expected ${expected}, got ${res} (Bogus padding)`);
    });

    [["AA", 1], ["AAA", 2], ["AAAA", 3], ["AAAAA", 3], ["AAAAAA", 4], ["AAAAAAA", 5], ["AAAAAAAA", 6]].forEach(([input, expected]) => {
        const res = Base64.decode(input);
        if (res.byteLength !== expected) throw new Error(`Expected ${expected}, got ${res.byteLength} (Length)`);
    });
});


test('urlEncode', () => {
    if (Base64.urlEncode(new Uint8Array([0xFF, 0xFF, 0xA0])) !== '__-g') throw new Error('Failed to encode 0xFF, 0xFF, 0xA0');
    [[new Uint8Array(1), 'AA'],[new Uint8Array(2), 'AAA']].forEach(([input, expected]) => {
        const res = Base64.urlEncode(input);
        if (res !== expected) throw new Error(`Expected ${expected}, got ${res}`);
    });
});

test('urlDecode', () => {
    [["__-g", [0xFF, 0xFF, 0xA0]], ["AA", [0]], ["AAA", [0, 0]]].forEach(([input, expected]) => {
        const res = Base64.urlDecode(input);
        if (!arrayEq(new Uint8Array(res), new Uint8Array(expected))) throw new Error(`Expected ${expected}, got ${res}`);
    });
});
