const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

console.log("Starting Server...");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

let teams = {
    "Sujin": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Ajin": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Abi": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Asoke": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Kamal": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Anish": { players: [], totalSpent: 0, remainingBudget: 150 },
    "DD": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Raja": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Aswath": { players: [], totalSpent: 0, remainingBudget: 150 },
    "Varshan": { players: [], totalSpent: 0, remainingBudget: 150 }
};

wss.on("connection", (ws) => {
    console.log("✅ WebSocket Connected");

    ws.send(JSON.stringify({ action: "updateTeams", teams }));

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.action === "updateTeams") {
                teams = data.teams;
                broadcast({ action: "updateTeams", teams });
            }
        } catch (error) {
            console.error("❌ Invalid JSON received:", error);
        }
    });

    ws.on("close", () => {
        console.log("❌ Client disconnected");
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});