import { gameSchemas } from './schemas.js';
import { charmap, reverseCharmap } from './charmap.js';
import { currentGiftMon } from './gift.js';

import 'dotenv/config'
import express, { json } from 'express';
const app = express();
app.use(json());

const PORT = process.env.PORT || 3000;

class BitBuffer {
    constructor() {
        this.buffer = [];
        this.currentByte = 0;
        this.bitPosition = 0;
    }

    // Writes bits to the buffer
    writeBits(value, numBits) {
        while (numBits > 0) {
            const remainingBits = 8 - this.bitPosition;
            const bitsToWrite = Math.min(remainingBits, numBits);
            const mask = (1 << bitsToWrite) - 1;
            const shiftedValue = (value & mask) << (remainingBits - bitsToWrite);
            this.currentByte |= shiftedValue;
            this.bitPosition += bitsToWrite;
            numBits -= bitsToWrite;
            value >>>= bitsToWrite;

            if (this.bitPosition === 8) {
                this.flushByte();
            }
        }
    }

    // Finalizes the current byte and adds it to the buffer
    flushByte() {
        if (this.bitPosition > 0 || this.currentByte !== 0) {
            this.buffer.push(this.currentByte);
            this.currentByte = 0;
            this.bitPosition = 0;
        }
    }

    // Finalizes any remaining bits and returns the buffer
    flush() {
        if (this.bitPosition > 0) {
            this.flushByte();
        }
    }

    // Returns the buffer as a Node.js Buffer object
    getBuffer() {
        this.flush();
        return Buffer.from(this.buffer);
    }

    // Reads bits from the buffer as an unsigned integer
    readBits(numBits) {
        let value = 0;
        let bitsToRead = numBits;

        while (bitsToRead > 0) {
            if (this.bitPosition === 0) {
                this.nextByte();  // Load the next byte from the buffer if needed
            }

            if (this.buffer.length === 0 && this.bitPosition === 0) {
                break;  // No more data to read
            }

            const remainingBits = 8 - this.bitPosition;
            const bitsAvailable = Math.min(remainingBits, bitsToRead);
            const mask = (1 << bitsAvailable) - 1;
            const readValue = (this.currentByte >> (remainingBits - bitsAvailable)) & mask;

            value |= (readValue << (numBits - bitsToRead));
            bitsToRead -= bitsAvailable;
            this.bitPosition += bitsAvailable;

            if (this.bitPosition === 8) {
                this.bitPosition = 0;
            }
        }

        // Ensure value is treated as an unsigned integer
        return value >>> 0;  // This forces the result to be interpreted as an unsigned 32-bit integer
    }

    // Loads the next byte from the buffer
    nextByte() {
        if (this.buffer.length > 0) {
            this.currentByte = this.buffer.shift();
            this.bitPosition = 0;
        } else {
            this.currentByte = 0;  // Set to 0 if there's no more data
        }
    }

    // Initializes the buffer and resets the BitBuffer state
    loadBuffer(inputBuffer) {
        this.buffer = Array.from(inputBuffer);
        this.currentByte = 0;
        this.bitPosition = 0;
    }
}

function serializeToBinary(data, schema) {
    const bitBuffer = new BitBuffer();

    function serializeField(value, numBits) {
        bitBuffer.writeBits(value, numBits);
    }

    function serializeStringField(string, maxLength) {
        let i;

        for (i = 0; i < string.length && i < maxLength; i++) {
            if (i < string.length) {
                const char = string[i];
                const code = charmap[char];
                if (code === undefined) {
                    throw new Error(`Character "${char}" not found in charmap`);
                }
                serializeField(code, 8);
            }
        }
        if (i < maxLength)
        {
            serializeField(0xFF, 8);
            i++
        }

        while (i < maxLength) {
            serializeField(0x00, 8); // Pad remaining space with empty characters
            i++
        }
    }

    function serializeObject(data, schema) {
        for (const [field, numBits] of Object.entries(schema)) {
            const value = data[field];

            if (value === undefined) {
                console.warn(`Warning: Value for field "${field}" is undefined.`);
            }

            console.log(`Serializing field: ${field}, numBits: ${numBits}`);

            if (typeof value === 'string') {
                const maxLength = numBits / 8; // Max string length based on bit size
                serializeStringField(value, maxLength);
            } else {
                serializeField(value, numBits);
            }
        }
    }

    serializeObject(data, schema);
    return bitBuffer.getBuffer();
}

function deserializeFromBinary(buffer, schema) {
    const bitBuffer = new BitBuffer();
    bitBuffer.buffer = Array.from(buffer);

    function deserializeField(numBits) {
        const value = bitBuffer.readBits(numBits);
        console.log(`Deserialized ${numBits} bits: Value = ${value}`);
        return value;
    }

    function deserializeStringField(maxLength) {
        let result = '';
        let bytesRead = 0;
        while (bytesRead < maxLength) {
            const code = deserializeField(8);
            if (code === 0xFF || code === 0x00) {
                result += ''; // Do nothing, or just continue
            } else {
                const char = reverseCharmap[code];
                if (char === undefined) {
                    throw new Error(`Code ${code} not found in reverse charmap`);
                }
                result += char;
            }
            bytesRead++;
        }
        return result;
    }

    function deserializeObject(schema) {
        const obj = {};
        for (const [field, numBits] of Object.entries(schema)) {
            if (numBits > 32 || field.includes('nickname') || field.includes('otName')) {
                const maxLength = numBits / 8;
                obj[field] = deserializeStringField(maxLength);
            } else {
                obj[field] = deserializeField(numBits);
            }
            console.log(`Field: ${field}, Value: ${obj[field]}`);
        }
        return obj;
    }

    return deserializeObject(schema);
}

// Middleware for authentication
function authenticate(req, res, next) {
    const { friendcode, password } = req.headers;
    const user = userDb.find(u => u.friendCode === friendcode && u.password === password); // Neeeeeeds configured
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
}

// GIFT Endpoint for retrieving a statically defined Pokémon from the server
app.get('/Gift', (req, res) => {
    const { gameidentifier } = req.headers;
    const mon = currentGiftMon;

    if (!mon) return res.status(404).json({ error: 'Mon not found' });
    if (!gameidentifier) return res.status(400).json({ error: 'No game identifier in header' });

    const gameSchema = gameSchemas[gameidentifier];
    if (!gameSchema) return res.status(400).json({ error: 'Invalid game identifier' });

    const binaryData = serializeToBinary(mon, gameSchema);

    try {
        const binaryData = serializeToBinary(mon, gameSchema);
        res.set('Content-Type', 'application/octet-stream');
        res.send(binaryData);
    } catch (error) {
        res.status(500).json({ error: `Serialization error: ${error.message}` });
    }
});

// Testing Endpoint that reverses the behaviour of the GIFT Endpoint to verify data
app.post('/reverseGift', (req, res) => {
    const { gameidentifier } = req.headers;

    if (!gameidentifier) return res.status(400).json({ error: 'No game identifier in header' });

    const gameSchema = gameSchemas[gameidentifier];
    if (!gameSchema) return res.status(400).json({ error: 'Invalid game identifier' });

    let binaryData = Buffer.alloc(0);

    // Collect the binary data from the request
    req.on('data', chunk => {
        binaryData = Buffer.concat([binaryData, chunk]);
    });

    req.on('end', () => {
        try {
            const mon = deserializeFromBinary(binaryData, gameSchema);

            // Log the deserialized object
            console.log('Deserialized Pokémon:', mon);

            // Send back a default response
            res.status(200).json({ success: true, message: 'Deserialization complete' });
        } catch (error) {
            res.status(500).json({ error: `Deserialization error: ${error.message}` });
        }
    });
});

// TAKE Endpoint for retrieving a Pokémon at a specificed position from the user's account
app.get('/Take', authenticate, (req, res) => {
    const { position, gameidentifier } = req.headers;
    const mon = req.user.monData.find(mon => mon.position == position);
    if (!mon) return res.status(404).json({ error: 'Mon not found' });

    if (!gameidentifier) return res.status(400).json({ error: 'No game identifier in header' });

    const gameSchema = gameSchemas[gameidentifier];
    if (!gameSchema) return res.status(400).json({ error: 'Invalid game identifier' });

    const binaryData = serializeToBinary(mon, gameSchema.binaryFormat);   

    res.set('Content-Type', 'application/octet-stream');
    res.send(binaryData);
});

// Deposit and other endpoints would also follow similar logic
// by adapting data to the correct schema and serializing/deserializing as needed

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Current Gift Mon is:`, currentGiftMon );
});