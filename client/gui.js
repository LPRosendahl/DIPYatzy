import { holdDie, holdScore, heldDice, heldScores, rollRandomDice, counter, calculateTotalSum, calculateUpperSum, calculateBonus, scoreValuesForDisplay } from "../server/logik.js";

const diceImages = Array.from(document.querySelectorAll(".dice-list img"));
const diceButtons = Array.from(document.querySelectorAll(".dice-list button"));
const rollButton = document.getElementById("roll-button");
const scoreInputs = Array.from(document.querySelectorAll(".score-list input"));
var rollCounter = document.getElementById("rollCounter");
let sum = document.getElementById("sum");
let upperSum = document.getElementById("upperSum")
let bonus = document.getElementById("bonus");

diceButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const isHeld = holdDie(index);
        button.classList.toggle("held", isHeld);
    });
});

scoreInputs.forEach((button, index) => {
    button.addEventListener("click", () => {
        const isHeld = holdScore(index);
        button.classList.toggle("held", isHeld);

        // Unholds all buttons
        diceButtons.forEach((diceButton, diceIndex) => {
            diceButton.classList.toggle("held", heldDice[diceIndex]);
        });

        renderScoreArea(scoreValuesForDisplay());
        renderScoreTotals();

        rollButton.click();
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

function renderScoreTotals() {
    sum.textContent = calculateTotalSum();
    upperSum.value = calculateUpperSum();
    upperSum.classList.toggle("bonus-reached", Number(upperSum.value) >= 63);
    bonus.textContent = calculateBonus();
}





// Når man holder en score, starter counter forfra.
// Når man  trykker på en score for at holde den, "slipper" man alle terninger

if (rollButton) {
    rollButton.addEventListener("click", () => {
        const diceValues = rollRandomDice();
        renderDice(diceValues);

        rollCounter.value = counter;

        // Indsætter alle værdier ind i Score area. Det ser lidt skørt ud.
        renderScoreArea(scoreValuesForDisplay());
        renderScoreTotals();
    });
}
