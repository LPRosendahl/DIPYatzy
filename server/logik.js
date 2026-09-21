const diceObject = {
    eyes: 0
};

let dice = []; // Oprettet timt Array
for (let i = 0; i < 5; i++) { // tæller 5 loops
    dice.push({ ...diceObject }); // For hvert loop tager den en ny kopi af diceObject.
}

// Metode som kaster terningen, 
function rollDice(diceToRoll = dice) {
    for (const die of diceToRoll) {
        die.eyes = Math.floor(Math.random() * 6) + 1;
    }
    return diceToRoll;
}

// Summen af alle terningerne i dice.
class YatzyResultCalculator {
    constructor(dice) {
        this.dice = dice;
    }

    upperSectionScore(eyes) {
        //TODO: Implement upperSectionScore method.
        return 0;
    }

    onePairScore() {
        //TODO: implement onePairScore method.
        return 0;
    }

    twoPairScore() {
        //TODO: implement twoPairScore method.
        return 0;
    }

    threeOfAKindScore() {
        //TODO: implement threeOfAKindScore method.
        return 0;
    }

    fourOfAKindScore() {
        //TODO: implement fourOfAKindScore method.
        return 0;
    }

    smallStraightScore() {
        //TODO: implement smallStraightScore method.
        return 0;
    }

    largeStraightScore() {
        //TODO: implement largeStraightScore method.
        return 0;
    }

    fullHouseScore() {
        //TODO: implement fullHouseScore method.
        return 0;
    }

    chanceScore() {
        //TODO: implement chanceScore method.
        return 0;
    }

    yatzyScore() {
        //TODO: implement yatzyScore method.
        return 0;
    }
}

module.exports = { dice, diceObject, rollDice, diceSum, YatzyResultCalculator };
