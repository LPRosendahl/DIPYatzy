import {
    getBonus,
    getHeldDice,
    getHeldScores,
    getLeaderboard,
    getMultiplayerState,
    getRollCounter,
    getScoreValues,
    getTotalSum,
    getUpperSum,
    registerSingleplayer,
    registerMultiplayer,
    rollDice,
    selectScore,
    subscribeToMultiplayerEvents,
    toggleDieHold
} from "./Facade.mjs";

const multiplayerApp = document.getElementById("multiplayer-app");
const diceImages = Array.from(document.querySelectorAll(".dice-list img"));
const diceButtons = Array.from(document.querySelectorAll(".dice-list button"));
const rollButton = document.getElementById("roll-button");
const scoreInputs = Array.from(document.querySelectorAll(".score-list input"));
const rollCounter = document.getElementById("rollCounter");
const sum = document.getElementById("sum");
const upperSum = document.getElementById("upperSum");
const bonus = document.getElementById("bonus");
const usernameForm = document.getElementById("username-form");
const usernameInput = document.getElementById("username");
const leaderboardList = document.getElementById("leaderboard-list");
const gameStatus = document.getElementById("game-status");
let gameFinished = false;
let multiplayerEvents = null;

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

function renderScoreArea(scores, heldScores, canAct = true) {
    if (!scores || scores.length === 0) return;

    scoreInputs.forEach((input, index) => {
        if (!heldScores[index] || multiplayerApp) {
            input.value = scores[index] ?? 0;
        }
        input.classList.toggle("held", Boolean(heldScores[index]));
        input.disabled = gameFinished || !canAct || Boolean(heldScores[index]);
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
// Tjekker om spillet er færdigt før den disabler rollButton

function renderGameStatus(heldScores) {
    gameFinished = heldScores.every(Boolean);
    if (gameStatus && gameFinished) {
        gameStatus.textContent = "Spillet er færdigt. Din score vises på forsiden.";
    }
    if (rollButton) {
        rollButton.disabled = gameFinished;
    }
}

// Vores leaderboar :)
function renderLeaderboard(entries) {
    if (!leaderboardList) return;

    leaderboardList.replaceChildren();
    if (entries.length === 0) {
        const entry = document.createElement("div");
        entry.className = "leaderboard-item";
        entry.textContent = "Ingen afsluttede spil endnu";
        leaderboardList.append(entry);
        return;
    }

    entries.forEach((entry, index) => {
        const row = document.createElement("div");
        row.className = "leaderboard-item";
        row.textContent = `${index + 1}. ${entry.username} - ${entry.score}`;
        leaderboardList.append(row);
    });
}

function renderMultiplayerState(update) {
    const state = update.state;
    const isPlayersTurn = state.playerId === multiplayerApp.dataset.userId;
    gameFinished = update.finished;

    renderDice(state.dice);
    renderHeldDice(state.heldDice);
    renderScoreArea(state.scores, state.heldScores, isPlayersTurn);
    renderRollCounter(state.counter);
    renderScoreTotals(state.totalSum, state.upperSum, state.bonus);
    renderLeaderboard(update.scoreboard);

    if (gameStatus) { // Skriver hvis tur det er hen over terningerne
        gameStatus.textContent = gameFinished
            ? "Spillet er færdigt."
            : isPlayersTurn
                ? `Det er din tur, ${state.username}.`
                : `Det er ${state.username}s tur.`;
    }
    if (rollButton) {
        rollButton.disabled = gameFinished || !isPlayersTurn;
    }
    diceButtons.forEach(button => {
        button.disabled = gameFinished || !isPlayersTurn;
    });
}

async function updateScoreTotals() {
    const total = await getTotalSum();
    const upper = await getUpperSum();
    const bonusValue = await getBonus();
    renderScoreTotals(total, upper, bonusValue);
}

async function updateLeaderboard() {
    try {
        renderLeaderboard(await getLeaderboard());
    } catch (error) {
        console.error("Could not update leaderboard:", error);
    }
}

function showRequestError(error) { // Kræs
    console.error("Game request failed:", error);
    window.alert(error instanceof Error ? error.message : String(error));
}

if (usernameForm) {
    usernameForm.addEventListener("submit", async event => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const mode = event.submitter instanceof HTMLButtonElement
            ? event.submitter.value
            : "singleplayer";
        try {
            if (mode === "multiplayer") {
                await registerMultiplayer(username);
                window.location.assign("/lobby");
            } else {
                await registerSingleplayer(username);
                window.location.assign("/singleplayer");
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : String(error));
        }
    });
}

diceButtons.forEach((button, index) => {
    button.addEventListener("click", async () => {
        try {
            const isHeld = await toggleDieHold(index);
            if (multiplayerApp) {
                renderMultiplayerState(await getMultiplayerState());
                return;
            }
            button.classList.toggle("held", isHeld);
        } catch (error) {
            showRequestError(error);
        }
    });
});

scoreInputs.forEach((input, index) => {
    input.addEventListener("click", async () => {
        try {
            await selectScore(index);
            if (multiplayerApp) {
                renderMultiplayerState(await getMultiplayerState());
                return;
            }
            renderHeldDice(await getHeldDice());
            const heldScores = await getHeldScores();
            renderScoreArea(await getScoreValues(), heldScores);
            await updateScoreTotals();

            renderGameStatus(heldScores);
            if (!gameFinished) {
                rollButton.click();
            } else {
                await updateLeaderboard();
            }
        } catch (error) {
            showRequestError(error);
        }
    });
});

if (rollButton) {
    rollButton.addEventListener("click", async () => {
        try {
            const diceValues = await rollDice();
            if (multiplayerApp) {
                renderMultiplayerState(await getMultiplayerState());
                return;
            }
            renderDice(diceValues);

            renderRollCounter(await getRollCounter());
            const heldScores = await getHeldScores();
            renderScoreArea(await getScoreValues(), heldScores);
            renderGameStatus(heldScores);
        } catch (error) {
            showRequestError(error);
        }
    });
}

async function loadInitialFields() {
    try {
        const diceValues = await rollDice();
        renderDice(diceValues);

        renderHeldDice(await getHeldDice());
        const heldScores = await getHeldScores();
        renderScoreArea(await getScoreValues(), heldScores);
        renderRollCounter(await getRollCounter());
        await updateScoreTotals();
        renderGameStatus(heldScores);
    } catch (error) {
        showRequestError(error);
    }
}

if (multiplayerApp) {
    (async () => {
        try {
            renderMultiplayerState(await getMultiplayerState());
            multiplayerEvents = subscribeToMultiplayerEvents((eventName, update) => {
                if (eventName === "game-state") {
                    renderMultiplayerState(update);
                }
            });
        } catch (error) {
            showRequestError(error);
        }
    })();
} else if (rollButton) { // Loader kun på spil siden
    loadInitialFields();
}

if (leaderboardList && !multiplayerApp) { // Loader kun på forsiden
    updateLeaderboard();
    window.setInterval(updateLeaderboard, 3000);
}
