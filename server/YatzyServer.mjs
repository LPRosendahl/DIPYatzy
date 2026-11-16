import { holdDie, holdScore, heldDice, heldScores, rollRandomDice, counter, calculateTotalSum, calculateUpperSum, calculateBonus, scoreValuesForDisplay } from "./logik.js";
import express from 'express';
import path from "node:path";
import { fileURLToPath } from "node:url";
const app = express();

const port = 6789;
const clientDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client");

app.use(express.json());
app.use(express.static(clientDirectory));

// GET til at hente data
app.get("/yatzy/held-dice", (req, res) => {
    res.json(heldDice);
});

app.get("/yatzy/held-scores", (req, res) => {
    res.json(heldScores);
});

app.get("/yatzy/dice/counter", (req, res) => {
    res.json(counter);
});

app.get("/yatzy/dice/calculateTotalSum", (req, res) => {
    res.json(calculateTotalSum());
});

app.get("/yatzy/dice/calculateUpperSum", (req, res) => {
    res.json(calculateUpperSum());
});

app.get("/yatzy/dice/calculateBonus", (req, res) => {
    res.json(calculateBonus());
});

app.get("/yatzy/dice/scoreValuesForDisplay", (req, res) => {
    res.json(scoreValuesForDisplay());
});


// POST til handlinger, der ændrer spillet

app.post("/yatzy/hold-die", (req, res) => {

    const index = req.body.index;
    if (!Number.isInteger(index) || index < 0 || index > 4) {
        return res.status(400).json({error: "Ugyldigt terningindeks" });
    }
    const result = holdDie(index);
    res.json(result);
});

app.post("/yatzy/hold-score", (req, res) => {
    const index = req.body.index;
    if (!Number.isInteger(index) || index < 0 || index > 14) {
        return res.status(400).json({error: "Ugyldigt scoreindeks" });
    }
    const result = holdScore(index);
    res.json(result);
});

app.post("/yatzy/roll-random-dice", (req, res) => {
    res.json(rollRandomDice());
});


app.listen(port);
console.log("Serveren kører på " + port);  