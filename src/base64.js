// calculate the length of the encoded string
export const calcEncodedLength = (input, padding) => {
    let length = Math.ceil(input * 4 / 3);
    if (padding && length % 4 !== 0) {
        length += 4 - (length % 4);
    }
    return length;
};

// calculate the length of the decoded string
export const calcDecodedLength = (input) => {
    const minLength = Math.ceil(input * 3 / 4);
    const pad = minLength % 3 ? 3 - minLength % 3 : 0;
    return minLength + pad;
}

export class Base64 {
    static Base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    static Base64UrlAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    constructor(alphabet, padding) {
        this.alphabet = new TextEncoder().encode(alphabet);
        this.padding = padding?.charCodeAt(0);
    }

    encode(input) {
        if (typeof input === 'string') input = new TextEncoder().encode(input);
        input = input.buffer ? input.buffer : input;
        let length = calcEncodedLength(input.byteLength, this.padding);
        let output = new ArrayBuffer(length);
        let outputView = new Uint8Array(output);
        let inputView = new Uint8Array(input);

        let i = 0;
        let j = 0;
        while (i < inputView.length) {
            let a = inputView[i++];
            let b = inputView[i++];
            let c = inputView[i++];
            if (a !== undefined) outputView[j++] = this.alphabet[a >>> 2];
            outputView[j++] = this.alphabet[((a & 3) << 4) | (b >>> 4)];
            if (b !== undefined) outputView[j++] = this.alphabet[((b & 15) << 2) | (c >>> 6)];
            if (c !== undefined) outputView[j++] = this.alphabet[c & 63];
        }
        if (this.padding) {
            while (j < outputView.byteLength) {
                outputView[j++] = this.padding;
            }
        }
        return new TextDecoder().decode(output);
    }

    decode(input) {
        if (typeof input === 'string') input = new TextEncoder().encode(input);
        input = input.buffer ? input.buffer : input;

        let output = new ArrayBuffer(calcDecodedLength(input.byteLength));
        let outputView = new Uint8Array(output);
        let inputView = new Uint8Array(input);
        let i = 0;
        let j = 0;
        let oLength = 0;
        while (i < inputView.length) {
            let a = this.alphabet.indexOf(inputView[i++]);
            let b = this.alphabet.indexOf(inputView[i++]);
            let c = this.alphabet.indexOf(inputView[i++]);
            let d = this.alphabet.indexOf(inputView[i++]);

            if (a === -1 || b === -1) continue;
            oLength++;

            let negatives = 2;
            if (c === -1) negatives--;
            if (d === -1) negatives--;
            oLength += negatives;

            let ax = (a << 2) | (b >>> 4);
            let bx = ((b & 15) << 4) | (c >>> 2);
            let cx = ((c & 3) << 6) | d;

            outputView[j++] = ax;
            outputView[j++] = bx;
            outputView[j++] = cx;
        }
        return output.slice(0, oLength);
    }

    static decode(input, padding = '') {
        return new Base64(Base64.Base64Alphabet, padding).decode(input);
    }

    static encode(input, padding = '=') {
        return new Base64(Base64.Base64Alphabet, padding).encode(input);
    }

    static urlDecode(input, padding = '') {
        return new Base64(Base64.Base64UrlAlphabet, padding).decode(input);
    }

    static urlEncode(input, padding = '') {
        return new Base64(Base64.Base64UrlAlphabet, padding).encode(input);
    }
}
