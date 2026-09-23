import { chanceScore, fourOfAKindScore, fullHouseScore, holdDie, holdScore, heldDice, heldScores, largeStraightScore, onePairScore, rollRandomDice, smallStraightScore, threeOfAKindScore, twoPairScore, upperSectionScore, yatzyScore } from "../server/logik.js";

const diceImages = Array.from(document.querySelectorAll(".dice-list img"));
const diceButtons = Array.from(document.querySelectorAll(".dice-list button"));
const rollButton = document.getElementById("roll-button");
const scoreInputs = Array.from(document.querySelectorAll(".score-list input"));

diceButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const isHeld = holdDie(index);
        button.classList.toggle("held", isHeld);
    });
});

scoreInputs.forEach((button, index) => {
    button.addEventListener("click", () => {
        const isHeld = holdScore(index);
        heldScores[index] = isHeld;
        button.classList.toggle("held", isHeld);

        // Unholds all buttons
        diceButtons.forEach((diceButton, diceIndex) => {
            diceButton.classList.toggle("held", heldDice[diceIndex]);
        });

        // Roll the dice, so no cheating ;)
        rollButton.click();

        calculateTotalSum();
    });
})

const dieImageNames = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six"
];


function renderDice(diceValues) {
    diceValues.forEach((value, index) => {
        const image = diceImages[index];
        if (!image) return;

        image.src = `images/${dieImageNames[value - 1]}.png`;
        image.alt = `Dice ${value}`;
    });
}

function renderScoreArea(scores) {
    if (!scores || scores.length === 0) return;

    scoreInputs.forEach((input, index) => {
        if (!heldScores[index]) {
            input.value = scores[index] ?? 0;
        }
    });
}

let sum = document.getElementById("sum");

function calculateTotalSum() {
    let total = 0;

    scoreInputs.forEach((input, index) => {
        if (heldScores[index]) {
            total += Number(input.value) || 0;
        }
    });

    sum.value = total;
}


let rollCounter = 3;
// Når man holder en score, starter counter forfra.
// Når man  trykker på en score for at holde den, "slipper" man alle terninger

if (rollButton) {
    rollButton.addEventListener("click", () => {
        const diceValues = rollRandomDice();
        renderDice(diceValues);

        // Denne linje skal erstattes af jeres logik, når I har score-beregningen klar.
        renderScoreArea([upperSectionScore(1), upperSectionScore(2), upperSectionScore(3), upperSectionScore(4),
            upperSectionScore(5), upperSectionScore(6), onePairScore(), twoPairScore(), threeOfAKindScore(),
            fourOfAKindScore(), smallStraightScore(), largeStraightScore(), fullHouseScore(), chanceScore(), yatzyScore()]);
    });
}
