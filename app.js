import { gameSchemas } from './schemas.js';
import { charmap, reverseCharmap } from './charmap.js';
import { createGiftMon, currentGiftMon } from './gift.js';

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

    writeBits(value, numBits) {
        while (numBits > 0) {
            const remainingBits = 8 - this.bitPosition;
            const bitsToWrite = Math.min(remainingBits, numBits);
            const mask = (1 << bitsToWrite) - 1;
            const shiftedValue = (value & mask) << (remainingBits - bitsToWrite);
            this.currentByte |= shiftedValue;
            this.bitPosition += bitsToWrite;
            numBits -= bitsToWrite;
            value >>= bitsToWrite;

            if (this.bitPosition === 8) {
                this.flushByte();
            }
        }
    }

    flushByte() {
        if (this.bitPosition > 0 || this.currentByte !== 0) {
            this.buffer.push(this.currentByte);
            this.currentByte = 0;
            this.bitPosition = 0;
        }
    }

    flush() {
        if (this.bitPosition > 0) {
            this.flushByte();
        }
    }

    getBuffer() {
        this.flush();
        return Buffer.from(this.buffer);
    }

    readBits(numBits) {
        let value = 0;
        while (numBits > 0) {
            const remainingBits = 8 - this.bitPosition;
            const bitsToRead = Math.min(remainingBits, numBits);
            const mask = (1 << bitsToRead) - 1;
            value = (value << bitsToRead) | ((this.currentByte >> (remainingBits - bitsToRead)) & mask);
            this.bitPosition += bitsToRead;
            numBits -= bitsToRead;

            if (this.bitPosition === 8) {
                this.bitPosition = 0;
            }
        }
        return value;
    }

    nextByte() {
        if (this.buffer.length > 0) {
            this.currentByte = this.buffer.shift();
            this.bitPosition = 0;
        }
    }
}

function getFieldValue(obj, path) {
    return path.split('.').reduce((o, key) => o && o[key], obj);
}

function serializeToBinary(data, schema) {
    const bitBuffer = new BitBuffer();
    const binaryFormat = schema.binaryFormat;

    function serializeField(value, numBits) {
        bitBuffer.writeBits(value, numBits);
    }

    function serializeStringField(string, maxLength) {
        for (let i = 0; i < maxLength; i++) {
            if (i < string.length) {
                const char = string[i];
                const code = charmap[char];
                if (code === undefined) {
                    throw new Error(`Character ${char} not found in charmap`);
                }
                serializeField(code, 8);
            } else {
                serializeField(0xFF, 8); // EOS character
                break;
            }
        }
    }

    function serializeObject(data, schema) {
        if (typeof schema !== 'object' || schema === null) {
            console.error('Invalid schema provided.');
            return;
        }

        for (const path of binaryFormat) {
            const fieldSchema = path.split('.').reduce((o, key) => o && o[key], schema);
            if (!fieldSchema) {
                console.error(`Schema for path "${path}" not found.`);
                continue;
            }

            const value = getFieldValue(data, path);

            if (value === undefined) {
                console.warn(`Warning: Value for field "${path}" is undefined.`);
            }

            console.log(`Serializing field: ${path}, fieldSchema: ${fieldSchema}`);

            if (typeof fieldSchema === 'number') {
                const numBits = fieldSchema;
                if (typeof value === 'string') {
                    const maxLength = numBits / 8; // Max string length based on bit size
                    serializeStringField(value, maxLength);
                } else {
                    serializeField(value, numBits);
                }
            } else if (typeof fieldSchema === 'object') {
                serializeObject(value, fieldSchema);
            } else {
                console.error(`Unsupported field schema type for field "${path}".`);
            }
        }
    }    

    serializeObject(data, schema.schema);
    return bitBuffer.getBuffer();
}

function deserializeFromBinary(buffer, schema) {
    const bitBuffer = new BitBuffer();
    bitBuffer.buffer = Array.from(buffer);

    function deserializeField(numBits) {
        return bitBuffer.readBits(numBits);
    }

    function deserializeStringField(maxLength) {
        let result = '';
        for (let i = 0; i < maxLength; i++) {
            const code = deserializeField(8);
            if (code === 0xFF) {
                break;  // Stop if EOS character is encountered. Rest are 0
            }
            const char = reverseCharmap[code];
            if (char === undefined) {
                throw new Error(`Code ${code} not found in reverse charmap`);
            }
            result += char;
        }
        return result;
    }    

    function deserializeObject(schema) {
        const obj = {};
        for (const [key, fieldSchema] of Object.entries(schema)) {
            if (typeof fieldSchema === 'string') {
                const numBits = parseInt(fieldSchema, 10);
                if (fieldSchema === 'string') {
                    const maxLength = numBits / 8;  // Calculate maximum string length based on bit size
                    obj[key] = deserializeStringField(maxLength);
                } else {
                    obj[key] = deserializeField(numBits);
                }
            } else if (Array.isArray(fieldSchema)) {
                obj[key] = [];
                for (let i = 0; i < fieldSchema.length; i++) {
                    obj[key].push(deserializeField(parseInt(fieldSchema[i], 10)));
                }
            } else if (typeof fieldSchema === 'object') {
                obj[key] = deserializeObject(fieldSchema);
            }
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
});