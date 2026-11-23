import { randomBytes } from "node:crypto";
import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMultiplayerGame, createUser } from "./logik.js";

const app = express();
const port = 9123;
const clientDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client");
const users = new Map();
const waitingPlayers = new Map();
const multiplayerClients = new Map(); // Aktive spiller forbindelser
let multiplayerHostId = null;
let multiplayerPlayers = []; // Aktive spiller objekter
let multiplayerGame = null;

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

function getMultiplayerUserForRequest(req, res) {
    const user = getUserForRequest(req, res);
    if (!user) return null;
    if (user.mode !== "multiplayer") {
        res.status(403).json({ error: "Denne side kræver en multiplayer-spiller." });
        return null;
    }
    return user;
}

function isInMultiplayerGame(user) {
    return multiplayerPlayers.some(player => player.id === user.id);
}

function getMultiplayerStateForUser(user, res) {
    if (!multiplayerGame || !isInMultiplayerGame(user)) {
        res.status(409).json({ error: "Multiplayer-spillet er ikke startet." });
        return null;
    }
    return multiplayerGame.getCurrentGameState();
}

function getMultiplayerGameForUser(user, res) {
    if (!multiplayerGame || !isInMultiplayerGame(user)) {
        res.status(409).json({ error: "Du er ikke med i et aktivt multiplayer-spil." });
        return null;
    }
    return multiplayerGame;
}

function writeEvent(response, eventName, data) {
    response.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
}

function publishLobbyState(started = false) {
    const data = started
        ? { started: true }
        : {
            started: false,
            players: Array.from(waitingPlayers.values())
        };
    const recipients = started
        ? new Set(multiplayerPlayers.map(player => player.id))
        : new Set(waitingPlayers.keys());

    for (const [response, userId] of multiplayerClients) {
        if (recipients.has(userId)) {
            writeEvent(response, "lobby-state", data);
        }
    }
}

function getMultiplayerUpdate() {
    return {
        state: multiplayerGame.getCurrentGameState(),
        currentPlayer: multiplayerGame.getCurrentPlayer(),
        scoreboard: multiplayerGame.getScoreboard(),
        finished: multiplayerGame.isFinished()
    };
}

function publishMultiplayerState() {
    if (!multiplayerGame) return;
    const data = getMultiplayerUpdate();
    for (const [response, userId] of multiplayerClients) {
        if (isInMultiplayerGame({ id: userId })) {
            writeEvent(response, "game-state", data);
        }
    }
}

function getFinishedGames() {
    return Array.from(users.values())
        .filter(user => user.mode !== "multiplayer" && user.game.isFinished())
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
    if (!user || user.mode !== "multiplayer") {
        res.redirect("/");
        return;
    }
    if (isInMultiplayerGame(user)) {
        res.redirect("/multiplayer");
        return;
    }
    if (!waitingPlayers.has(user.id)) {
        res.redirect("/");
        return;
    }
    res.render("Lobby", {
        userName: user.username,
        isHost: user.id === multiplayerHostId,
        canStart: waitingPlayers.size >= 2
    });
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

    if (multiplayerGame && !multiplayerGame.isFinished()) {
        return res.status(409).json({ error: "Multiplayer-spillet er allerede startet." });
    }
    if (multiplayerGame?.isFinished()) {
        multiplayerGame = null;
        multiplayerPlayers = [];
        multiplayerHostId = null;
        waitingPlayers.clear();
    }

    const user = createUser(username);
    user.mode = "multiplayer";
    users.set(normalizedUsername, user);
    waitingPlayers.set(user.id, {
        id: user.id,
        username: user.username
    });
    if (multiplayerHostId === null) {
        multiplayerHostId = user.id;
    }
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username });
    publishLobbyState();
});

app.get("/lobby/players", (req, res) => {
    const user = getMultiplayerUserForRequest(req, res);
    if (!user) return;
    if (!waitingPlayers.has(user.id)) {
        return res.status(409).json({ error: "Lobbyen er ikke længere åben." });
    }
    res.json(Array.from(waitingPlayers.values()));
});

app.post("/lobby/start", (req, res) => {
    const user = getMultiplayerUserForRequest(req, res);
    if (!user) return;
    if (!waitingPlayers.has(user.id)) {
        return res.status(409).json({ error: "Lobbyen er ikke længere åben." });
    }
    if (user.id !== multiplayerHostId) {
        return res.status(403).json({ error: "Kun lobbyens vært må starte spillet." });
    }
    if (waitingPlayers.size < 2) {
        return res.status(409).json({ error: "Der skal være mindst to spillere." });
    }

    multiplayerPlayers = Array.from(waitingPlayers.keys())
        .map(playerId => users.get(playerId.toLowerCase()));
    multiplayerGame = createMultiplayerGame(multiplayerPlayers);
    multiplayerGame.rollRandomDice(multiplayerGame.getCurrentPlayer().playerId);
    waitingPlayers.clear();

    res.json({ started: true });
    publishLobbyState(true);
    publishMultiplayerState();
});

app.get("/multiplayer/events", (req, res) => {
    const user = getMultiplayerUserForRequest(req, res);
    if (!user) return;
    const isWaiting = waitingPlayers.has(user.id);
    const isPlaying = isInMultiplayerGame(user);
    if (!isWaiting && !isPlaying) {
        return res.status(403).json({ error: "Du er ikke en del af multiplayer-lobbyen." });
    }

    res.status(200);
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
    });
    res.flushHeaders();
    multiplayerClients.set(res, user.id);

    if (isPlaying && multiplayerGame) {
        writeEvent(res, "lobby-state", { started: true });
        writeEvent(res, "game-state", getMultiplayerUpdate());
    } else {
        writeEvent(res, "lobby-state", {
            started: false,
            players: Array.from(waitingPlayers.values())
        });
    }

    const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 25000);
    req.on("close", () => {
        clearInterval(keepAlive);
        multiplayerClients.delete(res);
    });
});

app.get("/multiplayer", (req, res) => {
    const user = getUserFromSession(req);
    if (!user || user.mode !== "multiplayer") {
        res.redirect("/");
        return;
    }
    if (!isInMultiplayerGame(user)) {
        res.redirect(waitingPlayers.has(user.id) ? "/lobby" : "/");
        return;
    }
    res.render("indexMultiplayer", { userId: user.id });
});

app.get("/multiplayer/state", (req, res) => {
    const user = getMultiplayerUserForRequest(req, res);
    if (!user) return;
    if (!getMultiplayerStateForUser(user, res)) return;
    res.json(getMultiplayerUpdate());
});

app.get("/yatzy/leaderboard", (req, res) => {
    res.json(getFinishedGames());
});

app.get("/yatzy/held-dice", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.heldDice);
    }
    res.json(user.game.getHeldDice());
});

app.get("/yatzy/held-scores", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.heldScores);
    }
    res.json(user.game.getHeldScores());
});

app.get("/yatzy/dice/counter", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.counter);
    }
    res.json(user.game.getCounter());
});

app.get("/yatzy/dice/calculateTotalSum", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.totalSum);
    }
    res.json(user.game.calculateTotalSum());
});

app.get("/yatzy/dice/calculateUpperSum", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.upperSum);
    }
    res.json(user.game.calculateUpperSum());
});

app.get("/yatzy/dice/calculateBonus", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.bonus);
    }
    res.json(user.game.calculateBonus());
});

app.get("/yatzy/dice/scoreValuesForDisplay", (req, res) => {
    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const state = getMultiplayerStateForUser(user, res);
        if (!state) return;
        return res.json(state.scores);
    }
    res.json(user.game.scoreValuesForDisplay());
});

app.post("/yatzy/hold-die", (req, res) => {
    const index = req.body.index;
    if (!Number.isInteger(index) || index < 0 || index > 4) {
        return res.status(400).json({ error: "Ugyldigt terningindeks" });
    }

    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const game = getMultiplayerGameForUser(user, res);
        if (!game) return;
        try {
            const result = game.holdDie(user.id, index);
            res.json(result);
            publishMultiplayerState();
        } catch (error) {
            res.status(409).json({ error: error.message });
        }
        return;
    }
    res.json(user.game.holdDie(index));
});

app.post("/yatzy/hold-score", (req, res) => {
    const index = req.body.index;
    if (!Number.isInteger(index) || index < 0 || index > 14) {
        return res.status(400).json({ error: "Ugyldigt scoreindeks" });
    }

    const user = getUserForRequest(req, res);
    if (!user) return;
    if (user.mode === "multiplayer") {
        const game = getMultiplayerGameForUser(user, res);
        if (!game) return;
        try {
            const result = game.holdScore(user.id, index);
            if (!game.isFinished()) {
                game.rollRandomDice(game.getCurrentPlayer().playerId);
            }
            res.json(result);
            publishMultiplayerState();
        } catch (error) {
            res.status(409).json({ error: error.message });
        }
        return;
    }
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
    if (user.mode === "multiplayer") {
        const game = getMultiplayerGameForUser(user, res);
        if (!game) return;
        try {
            const result = game.rollRandomDice(user.id);
            res.json(result);
            publishMultiplayerState();
        } catch (error) {
            res.status(409).json({ error: error.message });
        }
        return;
    }
    if (user.game.isFinished()) {
        return res.status(409).json({ error: "Spillet er færdigt." });
    }
    res.json(user.game.rollRandomDice());
});

app.use(express.static(clientDirectory, { index: false }));

app.listen(port, () => {
    console.log("Serveren kører på " + port);
});
