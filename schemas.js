const gameSchemas = {
    "1VERDANT": {
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
        ]
    }
};

export { gameSchemas };