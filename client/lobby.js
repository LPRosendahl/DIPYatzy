const waitingPlayersBody = document.getElementById("waiting-players");
const lobbyStatus = document.getElementById("lobby-status");
const startGameForm = document.getElementById("start-game-form");
const startGameButton = document.getElementById("start-game-button");

function renderWaitingPlayers(players) {
    if (!Array.isArray(players)) {
        throw new TypeError("Lobby players response must be an array.");
    }

    const rows = players.map(player => {
        if (typeof player.username !== "string") {
            throw new TypeError("Lobby player is missing a username.");
        }

        const row = document.createElement("tr");
        const usernameCell = document.createElement("td");
        usernameCell.textContent = player.username;
        row.append(usernameCell);
        return row;
    });

    waitingPlayersBody.replaceChildren(...rows);
    lobbyStatus.textContent = players.length === 0
        ? "Der er ingen spillere i lobbyen endnu."
        : "";
    if (startGameButton) {
        startGameButton.disabled = players.length < 2;
    }
}

if (waitingPlayersBody && lobbyStatus) {
    const events = new EventSource("/multiplayer/events");
    events.addEventListener("lobby-state", event => {
        try {
            const update = JSON.parse(event.data);
            if (update.started) {
                window.location.assign("/multiplayer");
                return;
            }
            renderWaitingPlayers(update.players);
        } catch (error) {
            console.error("Could not update lobby:", error);
            lobbyStatus.textContent = "Kunne ikke opdatere lobbyen.";
        }
    });
    events.onerror = error => {
        console.error("Lobby event stream failed:", error);
        lobbyStatus.textContent = "Forbindelsen til lobbyen blev afbrudt.";
    };
}

if (startGameForm && startGameButton) {
    startGameForm.addEventListener("submit", async event => {
        event.preventDefault();
        startGameButton.disabled = true;
        try {
            const response = await fetch("/lobby/start", { method: "POST" });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Request failed: ${response.status}`);
            }
            window.location.assign("/multiplayer");
        } catch (error) {
            console.error("Could not start multiplayer game:", error);
            lobbyStatus.textContent = error instanceof Error ? error.message : String(error);
            startGameButton.disabled = false;
        }
    });
}
