const waitingPlayersBody = document.getElementById("waiting-players");
const lobbyStatus = document.getElementById("lobby-status");

async function updateWaitingPlayers() {
    try {
        const response = await fetch("/lobby/players");
        if (!response.ok) {
            throw new Error(`Could not load lobby players: ${response.status}`);
        }

        const players = await response.json();
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
    } catch (error) {
        console.error("Could not update lobby players:", error);
        lobbyStatus.textContent = "Kunne ikke hente spillerne. Prøver igen.";
    }
}

if (waitingPlayersBody && lobbyStatus) {
    updateWaitingPlayers();
    window.setInterval(updateWaitingPlayers, 3000);
}
