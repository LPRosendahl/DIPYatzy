export let counter = 3;
let bonusReached = false;
export let dice = Array.from({length: 5}, function (_, i) {
    return i + 1;
})

export let heldDice = [false, false, false, false, false];
export let heldScores = Array.from({ length: 15}, function (_, i) {
    return false;
})

// Ændrer kun de terninger som ikke er holdt 
export function rollRandomDice() {
    if (counter <= 0) {
        return dice;
    }
    dice = dice.map((value, index) => {
        // Terninger som allerede holdes returnerer den samme værdi
        if (heldDice[index]) {
            return value;
        }
        // Returnerer ny terning.
        return Math.floor(Math.random() * 6) + 1;
    });
    counter--;
    return dice;
}
// Skifter tilstand på die, så en terning som ikke holdes nu holdes.
export function holdDie(index) {
    heldDice[index] = !heldDice[index];
    return heldDice[index];
}

export function holdScore(index) {
    heldScores[index] = !heldScores[index];
    stopDiceHold();
    counter = 3; //.reset counter
    return heldScores[index];
}

function stopDiceHold() {
    heldDice = [false, false, false, false, false];
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
        if (val === eyes) {
            sum += val;
        }
    })
    return sum;
}

export function onePairScore() {
    const counts = countEyes();
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 2) return index * 2;
    }
    return 0;
}

export function twoPairScore() {
    const counts = countEyes();
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

export function threeOfAKindScore() {
    const counts = countEyes();
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 3) return index * 3;
    }
    return 0;
}

export function fourOfAKindScore() {
    const counts = countEyes();
    for (let index = 6; index >= 1; index--) {
        if (counts[index] >= 4) return index * 4;
        
    }
    return 0;
}

export function smallStraightScore() {
    const counts = countEyes();
    for (let index = 1; index <=5; index++) {
        if (counts[index] != 1) return 0;
    }
    return 15;
}

export function largeStraightScore() {
    const counts = countEyes();
    for (let index = 2; index <= 6; index++) {
        if (counts[index] != 1) return 0; 
    }
    return 20;
}

export function fullHouseScore() {
    const counts = countEyes();
    let three = 0, two = 0;
    for (let index = 1; index <= 6; index++) {
        if (counts[index] === 3) three = index * 3;
        if (counts[index] === 2) two = index * 2;        
    }
    if (three > 0 && two > 0) {
        return three + two;
    }
    return 0;
}

export function chanceScore() {
    let sum = 0;
    dice.forEach(val => {
        sum += val;
    })
    return sum;
}

export function yatzyScore() {
    let counter = 0;
    for (let index = 1; index < dice.length; index++) {
        if (dice[index] === dice[0]) {
            counter++;
        }
    }
    // Hvis den første er ens med de 4 andre == YATSY!!!
    if (counter === 4) {
        return 50
    } else {
        return 0;
    }
}

export function calculateTotalSum(scoreInputs) {
    let total = 0;

    if (bonusReached) {
        total += 50;
    }

    scoreInputs.forEach((input, index) => {
        if (heldScores[index]) {
            total += Number(input.value) || 0;
        }
    });

    return total;
}

export function calculateUpperSum(scoreInputs) {
    let total = 0;

    scoreInputs.forEach((input, index) => {
        if(heldScores[index] && index < 6) {
            total += Number(input.value) || 0;
        }
    });
    return total;
}

export function calculateBonus(scoreInputs) {
    if (calculateUpperSum(scoreInputs) >= 63) {
        bonusReached = true;
        return 50;
    }

    return 0;
}