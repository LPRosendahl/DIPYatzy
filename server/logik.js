const dice = Array.from({length: 5}, function (_, i) {
    return i + 1;
})

export function randomDiceValue() {
	return Math.floor(Math.random() * 6) + 1;
}

export function countEyes() {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const d of dice) {
        counts[d]++;
    }
    return counts;
}

// Summen af alle terningerne i dice.
export function upperSectionScore(eyes) {
    let sum = 0;
    dice.forEach(val => {
        
    })
    return sum;
}

export function onePairScore() {
    let score = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >=2) score = index * 2;
                
    }
    return score;
}

export function twoPairScore() {
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

export function threeOfAKindScore() {
    let score = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >= 3) return index * 3;
        
    }
    return 0;
}

export function fourOfAKindScore() {
    let score = 0;
    for (let index = 6; index >= 1; index--) {
        if (dice[index] >= 4) return index * 0;
        
    }
    return 0;
}

export function smallStraightScore() {
    //TODO: implement smallStraightScore method.
    return 0;
}

export function largeStraightScore() {
    //TODO: implement largeStraightScore method.
    return 0;
}

export function fullHouseScore() {
    //TODO: implement fullHouseScore method.
    return 0;
}

export function chanceScore() {
    //TODO: implement chanceScore method.
    return 0;
}

export function yatzyScore() {
    //TODO: implement yatzyScore method.
    return 0;
}


