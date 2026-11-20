function countEyesInDice(diceToCount) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const die of diceToCount) {
        counts[die]++;
    }
    return counts;
}

function upperSectionScoreFor(diceToScore, eyes) {
    let sum = 0;
    diceToScore.forEach(value => {
        if (value === eyes) {
            sum += value;
        }
    });
    return sum;
}

function onePairScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 2) return index * 2;
    }
    return 0;
}

function twoPairScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    let score = 0;
    let pairs = 0;
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 2) {
            pairs++;
            score += index * 2;
            if (pairs === 2) return score;
        }
    }
    return 0;
}

function threeOfAKindScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 3) return index * 3;
    }
    return 0;
}

function fourOfAKindScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 4) return index * 4;
    }
    return 0;
}

function smallStraightScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    for (let index = 1; index <= 5; index++) {
        if (counts[index] !== 1) return 0;
    }
    return 15;
}

function largeStraightScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    for (let index = 2; index <= 6; index++) {
        if (counts[index] !== 1) return 0;
    }
    return 20;
}

function fullHouseScoreFor(diceToScore) {
    const counts = countEyesInDice(diceToScore);
    let three = 0;
    let two = 0;
    for (let index = 1; index <= 6; index++) {
        if (counts[index] === 3) three = index * 3;
        if (counts[index] === 2) two = index * 2;
    }
    if (three > 0 && two > 0) {
        return three + two;
    }
    return 0;
}

function chanceScoreFor(diceToScore) {
    return diceToScore.reduce((sum, value) => sum + value, 0);
}

function yatzyScoreFor(diceToScore) {
    return diceToScore.every(value => value === diceToScore[0]) ? 50 : 0;
}

function scoreForCategory(index, diceToScore) {
    const scores = [
        upperSectionScoreFor(diceToScore, 1),
        upperSectionScoreFor(diceToScore, 2),
        upperSectionScoreFor(diceToScore, 3),
        upperSectionScoreFor(diceToScore, 4),
        upperSectionScoreFor(diceToScore, 5),
        upperSectionScoreFor(diceToScore, 6),
        onePairScoreFor(diceToScore),
        twoPairScoreFor(diceToScore),
        threeOfAKindScoreFor(diceToScore),
        fourOfAKindScoreFor(diceToScore),
        smallStraightScoreFor(diceToScore),
        largeStraightScoreFor(diceToScore),
        fullHouseScoreFor(diceToScore),
        chanceScoreFor(diceToScore),
        yatzyScoreFor(diceToScore)
    ];

    return scores[index] ?? 0;
}

export function createGame() {
    let counter = 3;
    let dice = Array.from({ length: 5 }, (_, index) => index + 1);
    let heldDice = [false, false, false, false, false];
    let heldScores = Array.from({ length: 15 }, () => false);
    const scoreValues = Array.from({ length: 15 }, () => 0);

    function rollRandomDice() {
        if (counter > 0) {
            dice = dice.map((value, index) => {
                if (heldDice[index]) {
                    return value;
                }
                return Math.floor(Math.random() * 6) + 1;
            });
            counter--;
        }
        return dice.slice();
    }

    function holdDie(index) {
        heldDice[index] = !heldDice[index];
        return heldDice[index];
    }

    function holdScore(index) {
        if (heldScores[index]) {
            return true;
        }

        scoreValues[index] = scoreForCategory(index, dice);
        heldScores[index] = true;
        heldDice = [false, false, false, false, false];
        counter = 3;
        return true;
    }

    function scoreValuesForDisplay() {
        return Array.from({ length: 15 }, (_, index) => {
            return heldScores[index] ? scoreValues[index] : scoreForCategory(index, dice);
        });
    }

    function calculateUpperSum() {
        let total = 0;
        heldScores.forEach((isHeld, index) => {
            if (isHeld && index < 6) {
                total += scoreValues[index];
            }
        });
        return total;
    }

    function calculateBonus() {
        return calculateUpperSum() >= 63 ? 50 : 0;
    }

    function calculateTotalSum() {
        let total = calculateBonus();
        heldScores.forEach((isHeld, index) => {
            if (isHeld) {
                total += scoreValues[index];
            }
        });
        return total;
    }

    return {
        rollRandomDice,
        holdDie,
        holdScore,
        scoreValuesForDisplay,
        calculateTotalSum,
        calculateUpperSum,
        calculateBonus,
        getCounter: () => counter,
        getDice: () => dice.slice(),
        getHeldDice: () => heldDice.slice(),
        getHeldScores: () => heldScores.slice(),
        isFinished: () => heldScores.every(Boolean)
    };
}

export function createUser(username) {
    return {
        id: username,
        username,
        game: createGame()
    };
}


//===========================================================
//                      TEST FUNKTIONER
//===========================================================

const defaultGame = createGame();

export let counter = defaultGame.getCounter();
export let dice = defaultGame.getDice();
export let heldDice = defaultGame.getHeldDice();
export let heldScores = defaultGame.getHeldScores();

function updateDefaultGameValues() {
    counter = defaultGame.getCounter();
    dice = defaultGame.getDice();
    heldDice = defaultGame.getHeldDice();
    heldScores = defaultGame.getHeldScores();
}

export function rollRandomDice() {
    const result = defaultGame.rollRandomDice();
    updateDefaultGameValues();
    return result;
}

export function holdDie(index) {
    const result = defaultGame.holdDie(index);
    updateDefaultGameValues();
    return result;
}

export function holdScore(index) {
    const result = defaultGame.holdScore(index);
    updateDefaultGameValues();
    return result;
}

export function scoreValuesForDisplay() {
    return defaultGame.scoreValuesForDisplay();
}

export function calculateTotalSum() {
    return defaultGame.calculateTotalSum();
}

export function calculateUpperSum() {
    return defaultGame.calculateUpperSum();
}

export function calculateBonus() {
    return defaultGame.calculateBonus();
}

export function countEyes(diceToCount = defaultGame.getDice()) {
    return countEyesInDice(diceToCount);
}

export function upperSectionScore(eyes, diceToScore = defaultGame.getDice()) {
    return upperSectionScoreFor(diceToScore, eyes);
}

export function onePairScore(diceToScore = defaultGame.getDice()) {
    return onePairScoreFor(diceToScore);
}

export function twoPairScore(diceToScore = defaultGame.getDice()) {
    return twoPairScoreFor(diceToScore);
}

export function threeOfAKindScore(diceToScore = defaultGame.getDice()) {
    return threeOfAKindScoreFor(diceToScore);
}

export function fourOfAKindScore(diceToScore = defaultGame.getDice()) {
    return fourOfAKindScoreFor(diceToScore);
}

export function smallStraightScore(diceToScore = defaultGame.getDice()) {
    return smallStraightScoreFor(diceToScore);
}

export function largeStraightScore(diceToScore = defaultGame.getDice()) {
    return largeStraightScoreFor(diceToScore);
}

export function fullHouseScore(diceToScore = defaultGame.getDice()) {
    return fullHouseScoreFor(diceToScore);
}

export function chanceScore(diceToScore = defaultGame.getDice()) {
    return chanceScoreFor(diceToScore);
}

export function yatzyScore(diceToScore = defaultGame.getDice()) {
    return yatzyScoreFor(diceToScore);
}
