let dice = [];
dice.length = 5;

// Summen af alle terningerne i dice.
function upperSectionScore(eyes) {
    let sum = 0;
    dice.forEach(diceObject => {
        sum += diceObject.eyes;
    })
    return sum;
}

function onePairScore() {
    let score = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >=2) score = index * 2;
                
    }
    return score;
}

function twoPairScore() {
    let score = 0;
    let pairs = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >= 2) {
            pairs++;
            score += index * 2;
            if (pairs === 2) return score;
        }        
    }
    return 0;
}

function threeOfAKindScore() {
    let score = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >= 3) return index * 3;
        
    }
    return 0;
}

function fourOfAKindScore() {
    let score = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >= 4) return index * 0;
        
    }
    return 0;
}

function smallStraightScore() {
    //TODO: implement smallStraightScore method.
    return 0;
}

function largeStraightScore() {
    //TODO: implement largeStraightScore method.
    return 0;
}

function fullHouseScore() {
    //TODO: implement fullHouseScore method.
    return 0;
}

function chanceScore() {
    //TODO: implement chanceScore method.
    return 0;
}

function yatzyScore() {
    //TODO: implement yatzyScore method.
    return 0;
}


module.exports = { dice, diceObject, rollDice, diceSum, YatzyResultCalculator };
