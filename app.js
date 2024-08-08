require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const gameSchemas = {
    "GAME_ID_EXPANSION": {
        "schema": {
            "box": {
                "personality": 32,
                "otId": 32,
                "nickname": 8 * 10,
                "language": 3,
                "hiddenNatureModifier": 5,
                "isBadEgg": 1,
                "hasSpecies": 1,
                "isEgg": 1,
                "memory": 5,
                "otName": 8 * 7,
                "markings": 4,
                "compressedStatus": 4,
                "checksum": 16,
                "hpLost": 10,
                "shinyModifier": 1,
                "memory2": 5,
                "secure": {
                    "substructs": [
                        "PokemonSubstruct0", 
                        "PokemonSubstruct1", 
                        "PokemonSubstruct2", 
                        "PokemonSubstruct3"
                    ]
                }
            },
            "status": 32,
            "level": 8,
            "mail": 8,
            "hp": 16,
            "maxHP": 16,
            "attack": 16,
            "defense": 16,
            "speed": 16,
            "spAttack": 16,
            "spDefense": 16
        },
        "subschemas": {
            "PokemonSubstruct0": {
                "species": 11,
                "teraType": 5,
                "heldItem": 10,
                "unused_02": 6,
                "experience": 21,
                "nickname11": 8,
                "daysSinceFormChange": 3,
                "ppBonuses": 8,
                "friendship": 8,
                "pokeball": 6,
                "nickname12": 8,
                "unused_0A": 2
            },
            "PokemonSubstruct1": {
                "move1": 11,
                "evolutionTracker1": 5,
                "move2": 11,
                "evolutionTracker2": 5,
                "move3": 11,
                "unused_04": 5,
                "move4": 11,
                "unused_06": 3,
                "hyperTrainedHP": 1,
                "hyperTrainedAttack": 1,
                "pp1": 7,
                "hyperTrainedDefense": 1,
                "pp2": 7,
                "hyperTrainedSpeed": 1,
                "pp3": 7,
                "hyperTrainedSpAttack": 1,
                "pp4": 7,
                "hyperTrainedSpDefense": 1
            },
            "PokemonSubstruct2": {
                "hpEV": 8,
                "attackEV": 8,
                "defenseEV": 8,
                "speedEV": 8,
                "spAttackEV": 8,
                "spDefenseEV": 8,
                "cool": 8,
                "beauty": 8,
                "cute": 8,
                "smart": 8,
                "tough": 8,
                "sheen": 8
            },
            "PokemonSubstruct3": {
                "pokerus": 8,
                "metLocation": 8,
                "metLevel": 7,
                "metGame": 4,
                "dynamaxLevel": 4,
                "otGender": 1,
                "hpIV": 5,
                "attackIV": 5,
                "defenseIV": 5,
                "speedIV": 5,
                "spAttackIV": 5,
                "spDefenseIV": 5,
                "isEgg": 1,
                "gigantamaxFactor": 1,
                "coolRibbon": 3,
                "beautyRibbon": 3,
                "cuteRibbon": 3,
                "smartRibbon": 3,
                "toughRibbon": 3,
                "championRibbon": 1,
                "winningRibbon": 1,
                "victoryRibbon": 1,
                "artistRibbon": 1,
                "effortRibbon": 1,
                "tentRibbon": 1,
                "travellerRibbon": 1, 
                "historicRibbon": 1,
                "countryRibbon": 1,
                "nationalRibbon": 1,
                "earthRibbon": 1,
                "worldRibbon": 1,
                "isShadow": 1,
                "unused_0B": 1,
                "abilityNum": 2,
                "modernFatefulEncounter": 1
            }
        },
        "binaryFormat": [
            "box.personality",
            "box.otId",
            "box.nickname",
            "box.language",
            "box.hiddenNatureModifier",
            "box.isBadEgg",
            "box.hasSpecies",
            "box.isEgg",
            "box.memory",
            "box.otName",
            "box.markings",
            "box.compressedStatus",
            "box.checksum",
            "box.hpLost",
            "box.shinyModifier",
            "box.memory2",
            "box.secure.substructs",
            "status",
            "level",
            "mail",
            "hp",
            "maxHP",
            "attack",
            "defense",
            "speed",
            "spAttack",
            "spDefense"
        ]
    }
};

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
        this.buffer.push(this.currentByte);
        this.currentByte = 0;
        this.bitPosition = 0;
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
                this.nextByte();
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

function serializeToBinary(data, schema) {
    const bitBuffer = new BitBuffer();

    function serializeField(value, numBits) {
        bitBuffer.writeBits(value, numBits);
    }

    function serializeObject(obj, schema) {
        for (const [key, fieldSchema] of Object.entries(schema)) {
            if (typeof fieldSchema === 'string') {
                const numBits = parseInt(fieldSchema, 10);
                serializeField(obj[key], numBits);
            } else if (Array.isArray(fieldSchema)) {
                for (let i = 0; i < fieldSchema.length; i++) {
                    serializeField(obj[key][i], parseInt(fieldSchema[i], 10));
                }
            } else if (typeof fieldSchema === 'object') {
                serializeObject(obj[key], fieldSchema);
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
        return bitBuffer.readBits(numBits);
    }

    function deserializeObject(schema) {
        const obj = {};
        for (const [key, fieldSchema] of Object.entries(schema)) {
            if (typeof fieldSchema === 'string') {
                const numBits = parseInt(fieldSchema, 10);
                obj[key] = deserializeField(numBits);
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

// TAKE Endpoint with Schema Handling
app.get('/take', authenticate, (req, res) => {
    const { position, gameidentifier } = req.headers;
    const mon = req.user.monData.find(mon => mon.position == position);
    if (!mon) return res.status(404).json({ error: 'Mon not found' });

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
