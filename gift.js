const defaultGiftMon = {
    personality: 1234567890,
    otId: 1234567890,
    nickname: 'DEFAULT',
    language: 2, // LANGUAGE_ENGLISH
    hiddenNatureModifier: 0,
    isBadEgg: 0,
    hasSpecies: 0,
    isEgg: 0,
    memory: 0,
    otName: 'DEFAULT',
    markings: 0,
    compressedStatus: 0,
    checksum: 0,
    hpLost: 0,
    shinyModifier: 0,
    memory2: 0,

        // Substruct 0
        species: 1, // SPECIES_BULBASAUR
        teraType: 0,
        heldItem: 0,
        unused_02: 0,
        experience: 0,
        nickname11: 0,
        daysSinceFormChange: 0,
        ppBonuses: 0,
        friendship: 0,
        pokeball: 1, // ITEM_POKEBALL
        nickname12: 0,
        unused_0A: 0,

        // Substruct 1
        move1: 1, // MOVE_POUND
        evolutionTracker1: 0,
        move2: 0,
        evolutionTracker2: 0,
        move3: 0,
        unused_04: 0,
        move4: 0,
        unused_06: 0,
        hyperTrainedHP: 0,
        hyperTrainedAttack: 0,
        pp1: 35,
        hyperTrainedDefense: 0,
        pp2: 0,
        hyperTrainedSpeed: 0,
        pp3: 0,
        hyperTrainedSpAttack: 0,
        pp4: 0,
        hyperTrainedSpDefense: 0,

        // Substruct 2
        hpEV: 0,
        attackEV: 0,
        defenseEV: 0,
        speedEV: 0,
        spAttackEV: 0,
        spDefenseEV: 0,
        cool: 0,
        beauty: 0,
        cute: 0,
        smart: 0,
        tough: 0,
        sheen: 0,

        // Substruct 3
        pokerus: 0,
        metLocation: 0,
        metLevel: 1,
        metGame: 0,
        dynamaxLevel: 0,
        otGender: 0,
        hpIV: 28,
        attackIV: 28,
        defenseIV: 28,
        speedIV: 28,
        spAttackIV: 28,
        spDefenseIV: 28,
        isEgg: 0,
        gigantamaxFactor: 0,
        coolRibbon: 0,
        beautyRibbon: 0,
        cuteRibbon: 0,
        smartRibbon: 0,
        toughRibbon: 0,
        championRibbon: 0,
        winningRibbon: 0,
        victoryRibbon: 0,
        artistRibbon: 0,
        effortRibbon: 0,
        tentRibbon: 0,
        travellerRibbon: 0,
        historicRibbon: 0,
        countryRibbon: 0,
        nationalRibbon: 0,
        earthRibbon: 0,
        worldRibbon: 0,
        isShadow: 0,
        unused_0B: 0,
        abilityNum: 0,
        modernFatefulEncounter: 0
};

function createGiftMon(customGiftMon = {}) {
    return mergeDeep(defaultGiftMon, customGiftMon);
}

function mergeDeep(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }
    return { ...target, ...source };
}

const customGiftMon = {
        personality: 3282278996,
        otId: 4002541612,
        nickname: 'Pikachu',
        otName: 'Ash',

            // Substruct 0
            species: 25,
            experience: 12345,
};

const currentGiftMon = createGiftMon(customGiftMon);

export { createGiftMon, currentGiftMon };