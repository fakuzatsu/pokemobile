/* Developers can submit schemas for their hack with thier own unique game id.
/  By going so, the API can adapt to the specific structure of the hack's Pokemon struct.
/  In my own schema, I use only BoxPokemon to reduce the size of the data, but this isnt necessary.
/  There are some hardcoded behaviours however:
/
/  - Fields over 32 bits are considered to be a string array and use the charmap for serialization.
/       Fields automatically use the charmap if their name contains 'nickname'.
/
/  - The schema does not automatically account for padding as this would be impossible for it to know.
/       As such you would be expected to add the padding manually.
*/
const gameSchemas = {
    "1VERDANT": {
        "personality": 32,
        "otId": 32,
        "nickname": 8 * 10, // string
        "language": 3,
        "hiddenNatureModifier": 5,
        "isBadEgg": 1,
        "hasSpecies": 1,
        "isEgg": 1,
        "memory": 5,
        "otName": 8 * 7, // string
        "markings": 4,
        "compressedStatus": 4,
        "checksum": 16,
        "hpLost": 10,
        "shinyModifier": 1,
        "memory2": 5,

            // Substruct 0
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
            "unused_0A": 2,

            // Substruct 1
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
            "hyperTrainedSpDefense": 1,

            // Substruct 2
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
            "sheen": 8,

            // Substruct 3
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
};

export { gameSchemas };