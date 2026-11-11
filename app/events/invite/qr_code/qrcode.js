class QRCode {
  #size;
  #field;
  #byteCount;
  #matrix;
  #reserved;

  static #MASK_FNS = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  static #RULE_3 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  static #RULE_3_REVERSED = [...QRCode.#RULE_3].reverse();

  #encoder(input) {
    const mode = [0, 1, 0, 0]; // 0100 byte mode

    const bytes = new TextEncoder().encode(input); // UTF-8 bytes
    const count = bytes.length;

    const bitSizeRelation = [
      [25, 34, 10],
      [29, 55, 15],
      [33, 80, 20],
      [37, 108, 26],
    ]
    const match = bitSizeRelation.find(([size, capacity, field]) => count <= capacity)
    this.#size = match[0];
    this.#byteCount = match[1];
    this.#field = match[2];

    const dataBits = []; 
    for (let i = 0; i < count; i++)
      for (let j = 0; j < 8; j++)
        dataBits.push((bytes[i] >> (7 - j)) & 1);

    const countBits = []; // 8-bit character count
    for (let i = 0; i < 8; i++)
      countBits.push((count >> (7 - i)) & 1);

    const bitstream = [...mode, ...countBits, ...dataBits]; // Combined array

    while (bitstream.length % 8 !== 0) bitstream.push(0); // moves to start of next byte

    let alternate = true; // Padding 11101100 and 00010001 alternating
    const padding1 = [1, 1, 1, 0, 1, 1, 0, 0];
    const padding2 = [0, 0, 0, 1, 0, 0, 0, 1];
    while (bitstream.length < (this.#byteCount * 8)) { // Version dependant Error correction level L data size in bits
      if (alternate) bitstream.push(...padding1);
      else bitstream.push(...padding2);
      alternate = !alternate;
    }

    return bitstream;
  }

  #toBytes(bits) {
    const bytes = [];
    let byte = [];
    for (let i = 0; i < bits.length; i++) {
      byte.push(bits[i]);
      if ((i + 1) % 8 == 0) {
        bytes.push(byte);
        byte = [];
      }
    }
    return bytes;
  }

  #toBits(bytes) {
    const bits = [];
    for (let i = 0; i < bytes.length; i++) {
      bits.push(...bytes[i]);
    }
    return bits;
  }

  #GFMULT(a, b) { // Primitive polynomial x⁸ + x⁴ + x³ + x² + 1 = 100011101
    const toInt = (bits) => bits.reduce((acc, bit) => (acc << 1) | bit, 0);
    const toBit = (n) => Array.from({ length: 8 }, (_, i) => (n >> (7 - i)) & 1);

    let aInt = toInt(a);
    let bInt = toInt(b);
    let result = 0;

    for (let i = 0; i < 8; i++) {
      if ((bInt >> i) & 1) {
        result ^= (aInt << i);
      }
    }

    const primitive = 0b100011101;
    for (let bit = 14; bit >= 8; bit--) {
      if ((result >> bit) & 1) {
        result ^= (primitive << (bit - 8));
      }
    }

    return toBit(result);
  }

  #GFXOR(a, b) {
    const c = [];
    for (let i = 0; i < 8; i++) c.push((a[i] ^ b[i]))
    return c;
  }

  #generatorPoly(degree) {
    const exp = new Array(256);
    const log = new Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      log[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    const mul = (a, b) => (a === 0 || b === 0 ? 0 : exp[(log[a] + log[b]) % 255]);

    // multiply (x + α^i) into the polynomial, one factor at a time
    let poly = [1]; // highest degree first
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];                  // poly * x
        next[j + 1] ^= mul(poly[j], exp[i]); // poly * α^i
      }
      poly = next;
    }

    // drop the leading 1 and convert to 8-bit arrays
    return poly.slice(1).map((n) => Array.from({ length: 8 }, (_, i) => (n >> (7 - i)) & 1));
  }

  #reedSolomon(bitstream) { // 26 codewords fixed: g(26) polynomial
    const codewords = this.#toBytes(bitstream);
    const correction = structuredClone(codewords);
    const padding = [0, 0, 0, 0, 0, 0, 0, 0];
    const gValues = this.#generatorPoly(this.#field);

    for (let i = 0; i < this.#field; i++) correction.push(padding);

    for (let i = 0; i < this.#byteCount; i++) { // ignores leading coefficients after using for factor
      const factor = correction[i];
      for (let j = 1; j <= this.#field; j++) {
        correction[i + j] = this.#GFXOR(correction[i + j], this.#GFMULT(factor, gValues[j - 1]));
      }
    }

    for (let i = 0; i < this.#field; i++) codewords.push(correction[this.#byteCount + i]);
    return this.#toBits(codewords);
  }

  #setFunction(row, col, value) {
    this.#matrix[row][col] = value;
    this.#reserved[row][col] = true;
  }

  #fixedPatternLargeSquare(row, col) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i == 0 || i == 6) this.#setFunction(row + i, col +j, 1);
        else if (j == 0 || j == 6) this.#setFunction(row + i, col +j, 1);
        else if (i > 1 && i < 5 && j > 1 && j < 5) this.#setFunction(row + i, col +j, 1);
        else this.#setFunction(row + i, col +j, 0);
      }
    }
  }

  #fixedPatternSmallSquare(row, col) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i == 0 || i == 4) this.#setFunction(row + i, col +j, 1);
        else if (j == 0 || j == 4) this.#setFunction(row + i, col +j, 1);
        else if (i == 2 && j == 2) this.#setFunction(row + i, col +j, 1);
        else this.#setFunction(row + i, col +j, 0);
      }
    }
  }

  #basicImage(bitstream) {
    this.#reserved = Array.from({ length: this.#size }, () => Array(this.#size).fill(false));;
    this.#matrix = Array.from({ length: this.#size }, () => Array(this.#size).fill(0));

    // fixed paterns
    this.#fixedPatternLargeSquare(0, 0);
    this.#fixedPatternLargeSquare(0, this.#size - 7);
    this.#fixedPatternLargeSquare(this.#size - 7, 0);
    this.#fixedPatternSmallSquare(this.#size - 9, this.#size - 9);

    // patern seperators
    for (let i = 0; i < 8; i++) {
      this.#setFunction(7, i, 0);
      this.#setFunction(i, 7, 0);
      this.#setFunction(7, this.#size - 1 - i, 0);
      this.#setFunction(i, this.#size - 8, 0);
      this.#setFunction(this.#size - 8, i, 0);
      this.#setFunction(this.#size - 1 - i, 7, 0);
    }

    // timing patterns
    for (let i = 8; i < this.#size - 8; i++) {
      this.#setFunction(6, i, i % 2 === 0 ? 1 : 0);
      this.#setFunction(i, 6, i % 2 === 0 ? 1 : 0);
    }

    // reserved information pattern + reserved dark module
    for (let i = 0; i < this.#size; i++) {
      if (i < 9 || i > this.#size - 9) {
        this.#reserved[8][i] = true;
        this.#reserved[i][8] = true;
      }
    }

    // dark module set 
    this.#matrix[this.#size - 8][8] = 1;

    // place data bits
    let bitIndex = 0;
    let upward = true;
    for (let col = this.#size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // skip the vertical timing column
      for (let k = 0; k < this.#size; k++) {
        const row = upward ? this.#size - 1 - k : k;
        for (let c = 0; c < 2; c++) {
          const x = col - c; // right module first, then left
          if (this.#reserved[row][x]) continue;
          this.#matrix[row][x] = bitIndex < bitstream.length ? bitstream[bitIndex++] : 0; // remainder bits = 0
        }
      }
      upward = !upward;
    }

    return this.#matrix;
  }

  #applyMask(base, maskIndex) {
    const test = QRCode.#MASK_FNS[maskIndex];
    return base.map((line, row) =>
      line.map((module, col) =>
        this.#reserved[row][col] ? module : module ^ (test(row, col) ? 1 : 0)
      )
    );
  }

  #formatBits(maskIndex) {
    const data = (0b01 << 3) | maskIndex;
    let rest = data;
    for (let i = 0; i < 10; i++) rest = (rest << 1) ^ ((rest >>> 9) * 0b10100110111);
    return ((data << 10) | rest) ^ 0b101010000010010;
  }

  #placeFormat(matrix, maskIndex) {
    const size = matrix.length;
    const bits = this.#formatBits(maskIndex);
    const bit = (i) => (bits >>> i) & 1; // bit 0 = least significant
 
    for (let i = 0; i <= 5; i++) matrix[i][8] = bit(i);
    matrix[7][8] = bit(6);
    matrix[8][8] = bit(7);
    matrix[8][7] = bit(8);
    for (let i = 9; i < 15; i++) matrix[8][14 - i] = bit(i);
 
    for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = bit(i);
    for (let i = 8; i < 15; i++) matrix[size - 15 + i][8] = bit(i);
  }

  #rule1(line) {
    let penalty = 0;
    let run = 0;
    let prev = -1;
    for (const cell of line) {
      if (cell === prev) {
        run++;
        if (run === 5) penalty += 3;
        else if (run > 5) penalty++;
      } else {
        prev = cell;
        run = 1;
      }
    }
    return penalty;
  }

  #rule3(line) {
    let found = 0;
    const pattern = QRCode.#RULE_3;
    const reversed = QRCode.#RULE_3_REVERSED;
    for (let i = 0; i <= line.length - pattern.length; i++) {
      if (pattern.every((v, k) => line[i + k] === v)) found++;
      if (reversed.every((v, k) => line[i + k] === v)) found++;
    }
    return found * 40;
  }

  #penalty(matrix) {
    const size = matrix.length;
    const columns = matrix.map((_, c) => matrix.map((row) => row[c]));
    const lines = [...matrix, ...columns]; // every row and every column
 
    let total = 0;
 
    // Rules 1 & 3
    for (const line of lines) total += this.#rule1(line) + this.#rule3(line);
 
    // Rule 2: 3 points for every 2x2 block of one color
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const m = matrix[r][c];
        if (matrix[r][c + 1] === m && matrix[r + 1][c] === m && matrix[r + 1][c + 1] === m) total += 3;
      }
    }
 
    // Rule 4: balance of dark/light modules
    const dark = matrix.reduce((sum, line) => sum + line.reduce((s, cell) => s + cell, 0), 0);
    const percentage = (dark * 100) / (size * size);
    total += Math.abs(Math.trunc(percentage / 5 - 10)) * 10;
 
    return total;
  }

  #bestMask(base) {
    let best = { matrix: null, mask: -1, score: Infinity };
    for (let mask = 0; mask < 8; mask++) {
      const candidate = this.#applyMask(base, mask);
      this.#placeFormat(candidate, mask); // format info is scored
      const score = this.#penalty(candidate);
      if (score < best.score) best = { matrix: candidate, mask, score };
    }
    return best;
  }

  async #print(output) { // temporary functionality for terminal testing
    const cols = process.stdout.columns;
    const rows = process.stdout.rows;
 
    process.stdout.write("\x1b[47m\x1b[30m");        // white bg, black fg
    process.stdout.write("\x1b[2J\x1b[3J\x1b[H");    // clear screen, cursor home
    process.stdout.write(" ".repeat(cols * rows));   // fill with background
    process.stdout.write("\x1b[1;1H");               // cursor to top-left
 
    const tbit = "\u2588\u2588";
    const fbit = "  ";
 
    for (let i = 0; i < output.length; i++) {
      process.stdout.write(`\x1b[${i + 3};5H`);
      for (let j = 0; j < output[i].length; j++) {
        process.stdout.write(output[i][j] ? tbit : fbit);
      }
    }
    process.stdout.write(`\x1b[${output.length + 5};1H`);
    process.stdout.write("\x1b[0m"); // reset colors
  }
 
  // Builds the finished symbol without printing it
  generate(str) {
    const result = this.#bestMask(this.#basicImage(this.#reedSolomon(this.#encoder(str))));
    this.#matrix = result.matrix;
    return result.matrix;
  }
 
  async generatorTerminal(str) {
    const matrix = this.generate(str);
    await this.#print(matrix);
  }
}

export function generate(str) {
  return new QRCode().generate(str);
}
 
//new QRCode().generatorTerminal("google.com");