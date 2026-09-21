import { rollRandomDice } from "../server/logik.js";

const diceImages = Array.from(document.querySelectorAll(".dice-list img"));
const rollButton = document.getElementById("roll-button");
const scoreInputs = Array.from(document.querySelectorAll(".score-list input"));

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
        input.value = scores[index] ?? 0;
    });
}

if (rollButton) {
    rollButton.addEventListener("click", () => {
        const diceValues = rollRandomDice();
        renderDice(diceValues);

        // Denne linje skal erstattes af jeres logik, når I har score-beregningen klar.
        renderScoreArea([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
}
