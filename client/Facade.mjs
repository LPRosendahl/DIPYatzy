/*
The GUI uses these functions to communicate with YatzyServer.
*/

const API_BASE_URL = "/yatzy";

async function get(path) {
    const respons = await fetch(`${API_BASE_URL}${path}`);
    if (respons.status !== 200) {
        throw new Error(respons.status);
    }
    return await respons.json();
}

async function post(path, data = {}) {
    const respons = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (respons.status !== 200) {
        throw new Error(respons.status);
    }
    return await respons.json();
}

export function getHeldDice() {
    return get("/held-dice");
}

export function getHeldScores() {
    return get("/held-scores");
}

export function getRollCounter() {
    return get("/dice/counter");
}

export function getTotalSum() {
    return get("/dice/calculateTotalSum");
}

export function getUpperSum() {
    return get("/dice/calculateUpperSum");
}

export function getBonus() {
    return get("/dice/calculateBonus");
}

export function getScoreValues() {
    return get("/dice/scoreValuesForDisplay");
}

export function rollDice() {
    return post("/roll-random-dice");
}

export function toggleDieHold(index) {
    return post("/hold-die", { index });
}

export function selectScore(index) {
    return post("/hold-score", { index });
}
