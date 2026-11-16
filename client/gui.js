import {
    getBonus,
    getHeldDice,
    getHeldScores,
    getRollCounter,
    getScoreValues,
    getTotalSum,
    getUpperSum,
    rollDice,
    selectScore,
    toggleDieHold
} from "./Facade.mjs";

const diceImages = Array.from(document.querySelectorAll(".dice-list img"));
const diceButtons = Array.from(document.querySelectorAll(".dice-list button"));
const rollButton = document.getElementById("roll-button");
const scoreInputs = Array.from(document.querySelectorAll(".score-list input"));
const rollCounter = document.getElementById("rollCounter");
const sum = document.getElementById("sum");
const upperSum = document.getElementById("upperSum");
const bonus = document.getElementById("bonus");

const dieImageNames = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six"
];

function renderDice(diceValues) {
    if (!diceValues) {
        diceImages.forEach(image => {
            image.hidden = true;
        });
        return;
    }

    diceValues.forEach((value, index) => {
        const image = diceImages[index];
        if (!image) return;

        image.src = `images/${dieImageNames[value - 1]}.png`;
        image.alt = `Dice ${value}`;
        image.hidden = false;
    });
}

function renderHeldDice(heldDice) {
    diceButtons.forEach((button, index) => {
        button.classList.toggle("held", Boolean(heldDice[index]));
    });
}

function renderScoreArea(scores, heldScores) {
    if (!scores || scores.length === 0) return;

    scoreInputs.forEach((input, index) => {
        if (!heldScores[index]) {
            input.value = scores[index] ?? 0;
        }
        input.classList.toggle("held", Boolean(heldScores[index]));
    });
}

function renderScoreTotals(total, upper, bonusValue) {
    sum.textContent = total;
    upperSum.value = upper;
    upperSum.classList.toggle("bonus-reached", Number(upper) >= 63);
    bonus.textContent = bonusValue;
}

function renderRollCounter(counter) {
    rollCounter.value = counter;
}

async function updateScoreTotals() {
    const total = await getTotalSum();
    const upper = await getUpperSum();
    const bonusValue = await getBonus();
    renderScoreTotals(total, upper, bonusValue);
}

function showRequestError(error) { // Kræs
    console.error("Game request failed:", error);
    window.alert(error instanceof Error ? error.message : String(error));
}

diceButtons.forEach((button, index) => {
    button.addEventListener("click", async () => {
        try {
            const isHeld = await toggleDieHold(index);
            button.classList.toggle("held", isHeld);
        } catch (error) {
            showRequestError(error);
        }
    });
});

scoreInputs.forEach((input, index) => {
    input.addEventListener("click", async () => {
        try {
            const isHeld = await selectScore(index);
            input.classList.toggle("held", isHeld);

            renderHeldDice(await getHeldDice());
            await updateScoreTotals();

            rollButton.click();
        } catch (error) {
            showRequestError(error);
        }
    });
});

if (rollButton) {
    rollButton.addEventListener("click", async () => {
        try {
            const diceValues = await rollDice();
            renderDice(diceValues);

            renderRollCounter(await getRollCounter());
            renderScoreArea(await getScoreValues(), await getHeldScores());
        } catch (error) {
            showRequestError(error);
        }
    });
}

async function loadInitialFields() {
    try {
        renderHeldDice(await getHeldDice());
        renderScoreArea(await getScoreValues(), await getHeldScores());
        renderRollCounter(await getRollCounter());
        await updateScoreTotals();
    } catch (error) {
        showRequestError(error);
    }
}

renderDice();
loadInitialFields();
