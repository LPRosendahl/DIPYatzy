import { randomBytes } from "node:crypto";
import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createUser } from "./logik.js";

const app = express();
const port = 9123;
const clientDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client");
const users = new Map();

app.set("views", clientDirectory);
app.set("view engine", "pug");

app.use(express.json());
app.use(session({
    secret: randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

function getUserFromSession(req) {
    if (!req.session.userId) return null;
    return users.get(req.session.userId.toLowerCase()) ?? null;
}

function getUserForRequest(req, res) {
    const user = getUserFromSession(req);
    if (!user) {
        res.status(401).json({ error: "Start et singleplayer-spil først." });
        return null;
    }
    return user;
}

function getFinishedGames() {
    return Array.from(users.values())
        .filter(user => user.game.isFinished())
        .map(user => ({
            username: user.username,
            score: user.game.calculateTotalSum()
        }))
        .sort((first, second) => second.score - first.score);
}

function getCurrentScores() {
    return Array.from(users.values())
        .filter(user => user.game.getHeldScores)
        .map(user => ({
            username: user.username,
            score: user.game.calculateTotalSum()
        }))
        .sort((first, second) => second.score - first.score);
}

app.get("/", (req, res) => {
    const user = getUserFromSession(req);
    res.render("MainMenu", {
        userName: user?.username ?? "",
        scores: getFinishedGames()
    });
});

app.get("/", (req, res) => {
    const user = getUserFromSession(req);
    res.render("MainMenu", {
        userName: user?.username ?? "",
        scores: getFinishedGames()
    });
});

app.post("/singleplayer/:name", (req, res) => {
    const username = req.params.name.trim();
    if (!username || username.length > 30) {
        return res.status(400).json({ error: "Brugernavnet skal være 1-30 tegn." });
    }

    const normalizedUsername = username.toLowerCase();
    if (users.has(normalizedUsername)) {
        return res.status(409).json({ error: "Dette brugernavn er allerede taget." });
    }

    const user = createUser(username);
    users.set(normalizedUsername, user);
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username });
});

app.get("/singleplayer", (req, res) => {
    if (!getUserFromSession(req)) {
        res.redirect("/");
        return;
    }
    res.sendFile(path.join(clientDirectory, "index.html"));
});

app.get("/lobby", (req, res) => {
    const user = getUserFromSession(req);
    if (!user) {
        res.redirect("/");
        return;
    }
    res.render("Lobby", { userName: user.username });
});



app.post("/multiplayer/:name", (req, res) => {
    const username = req.params.name.trim();
    if (!username || username.length > 30) {
        return res.status(400).json({ error: "Brugernavnet skal være 1-30 tegn." });
    }

    const normalizedUsername = username.toLowerCase();
    if (users.has(normalizedUsername)) {
        return res.status(409).json({ error: "Dette brugernavn er allerede taget." });
    }

    const user = createUser(username);
    users.set(normalizedUsername, user);
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username });
});

// TODO
app.get("/multiplayer", (req, res) => {
    if (!getUserFromSession(req)) {
        res.redirect("/");
        return;
    }
    res.render("indexMultiplayer");
});

app.get("/yatzy/leaderboard", (req, res) => {
    res.json(getFinishedGames());
});

app.get("/yatzy/held-dice", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.getHeldDice());
});

app.get("/yatzy/held-scores", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.getHeldScores());
});

app.get("/yatzy/dice/counter", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.getCounter());
});

app.get("/yatzy/dice/calculateTotalSum", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.calculateTotalSum());
});

app.get("/yatzy/dice/calculateUpperSum", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.calculateUpperSum());
});

app.get("/yatzy/dice/calculateBonus", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.calculateBonus());
});

app.get("/yatzy/dice/scoreValuesForDisplay", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.scoreValuesForDisplay());
});

app.post("/yatzy/hold-die", (req, res) => {
    const index = req.body.index;
    if (!Number.isInteger(index) || index < 0 || index > 4) {
        return res.status(400).json({ error: "Ugyldigt terningindeks" });
    }

    const user = getUserForRequest(req, res);
    if (!user) return;
    res.json(user.game.holdDie(index));
});

app.post("/yatzy/hold-score", (req, res) => {
    const index = req.body.index;
    if (!Number.isInteger(index) || index < 0 || index > 14) {
        return res.status(400).json({ error: "Ugyldigt scoreindeks" });
    }

    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.game.getHeldScores()[index]) {
        return res.status(409).json({ error: "Scorekategorien er allerede valgt." });
    }
    if (user.game.isFinished()) {
        return res.status(409).json({ error: "Spillet er allerede færdigt." });
    }

    res.json(user.game.holdScore(index));
});

app.post("/yatzy/roll-random-dice", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.game.isFinished()) {
        return res.status(409).json({ error: "Spillet er færdigt." });
    }
    res.json(user.game.rollRandomDice());
});

app.use(express.static(clientDirectory, { index: false }));

app.listen(port, () => {
    console.log("Serveren kører på " + port);
});
