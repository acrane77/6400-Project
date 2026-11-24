const { test } = require('node:test')
const assert = require('node:assert/strict')
const jsQR = require('jsqr')

async function decodeQR(input) {
    const { generate } = await import(
        '../app/events/invite/qr_code/qrcode.js'
    )

    const matrix = generate(input)
    const scale = 8
    const border = 4
    const size = (matrix.length + border * 2) * scale

    const pixels = new Uint8ClampedArray(size * size * 4)
    pixels.fill(255)

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] !== 1) continue

            for (let y = 0; y < scale; y++) {
                for (let x = 0; x < scale; x++) {
                    const py = (row + border) * scale + y
                    const px = (col + border) * scale + x
                    const index = (py * size + px) * 4

                    pixels[index] = 0
                    pixels[index + 1] = 0
                    pixels[index + 2] = 0
                }
            }
        }
    }

    return jsQR(pixels, size, size)?.data
}

test('QR code decodes to the original text', async () => {
    const input = 'Hello World'
    assert.equal(await decodeQR(input), input)
})

test('QR code correctly encodes a local invitation URL', async () => {
    const input = 'http://localhost:3000/events/invite/' + 'a'.repeat(64)
    assert.equal(await decodeQR(input), input)
})

test('QR code correctly encodes an HTTPS invitation URL', async () => {
    const input =
        'https://example.com/events/invite/' +
        '0123456789abcdef'.repeat(4)

    assert.equal(await decodeQR(input), input)
})

for (let length = 1; length <= 106; length++) {
    test(`QR code correctly encodes ${length} bytes`, async () => {
        const input = 'a'.repeat(length)
        assert.equal(await decodeQR(input), input)
    })
}
