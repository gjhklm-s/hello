
const socket = new WebSocket("wss://ccc7-182-74-203-154.ngrok-free.app");

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.action === "updateTeams") {
        teams = data.teams;
        updateTeamTables();
    }
};

const players = {
    Wicketkeepers: ["Jos Buttler", "Quinton De Kock", "Nicholas Pooran", "Rishab Pant", "Phil Salt", "Ishan Kishan"],
    Openers: ["Ruturaj Gaikwad", "Shubman Gill", "Abhishek Sharma"],
    MiddleOrder: ["David Miller", "Suryakumar Yadav", "Will Jacks"],
    AllRounders: ["Ben Stokes", "Sunil Narine", "Andre Russell"],
    Spinners: ["Rashid Khan", "Ravichandran Ashwin"],
    FastBowlers: ["Matheesha Pathirana", "Mitchell Starc"],
    ForeignPlayers: ["Faf du Plessis", "Glenn Maxwell"]
};

let teams = {}; // Ensure teams is always initialized

function setTeam() {
    const selectedTeam = document.getElementById("teamName").value;
    if (!selectedTeam) {
        alert("Please select a team!");
        return;
    }
    document.getElementById("selectedTeam").textContent = "Selected Team: " + selectedTeam;

    // Initialize team if not already present
    if (!teams[selectedTeam]) {
        teams[selectedTeam] = {
            players: [],
            totalSpent: 0,
            remainingBudget: 150
        };
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        let speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US';
        window.speechSynthesis.speak(speech);
    }
}

function addToAuction() {
    const selectedTeam = document.getElementById("teamName").value;
    const player = document.getElementById("playerName").value;
    let price = parseFloat(document.getElementById("price").value);

    if (!selectedTeam || !player || isNaN(price) || price <= 0) {
        alert("Please enter valid details!");
        speakText("Please enter valid details!");
        return;
    }

    // Ensure the team exists
    if (!teams[selectedTeam]) {
        teams[selectedTeam] = {
            players: [],
            totalSpent: 0,
            remainingBudget: 150
        };
    }

    if (teams[selectedTeam].remainingBudget < price) {
        alert("Not enough budget!");
        speakText("Not enough budget for " + selectedTeam);
        return;
    }

    teams[selectedTeam].players.push({ player, price });
    teams[selectedTeam].totalSpent += price;
    teams[selectedTeam].remainingBudget -= price;

    socket.send(JSON.stringify({ action: "updateTeams", teams }));
}

function removePlayer(team, index) {
    if (!teams[team]) return; // Prevent error if team doesn't exist

    teams[team].totalSpent -= teams[team].players[index].price;
    teams[team].remainingBudget += teams[team].players[index].price;
    teams[team].players.splice(index, 1);

    socket.send(JSON.stringify({ action: "updateTeams", teams }));
}

function updateTeamTables() {
    const teamsContainer = document.getElementById("teamsContainer");
    teamsContainer.innerHTML = ""; // Clear previous content

    for (let team in teams) {
        const teamData = teams[team];

        // Create a container for each team
        const teamDiv = document.createElement("div");
        teamDiv.classList.add("team-section");

        teamDiv.innerHTML = `
            <h3>${team} (Players: ${teamData.players.length}/10)</h3>
            <p><strong>Total Spent: ₹${teamData.totalSpent.toFixed(2)} Cr</strong></p>
            <p><strong>Remaining Budget: ₹${teamData.remainingBudget.toFixed(2)} Cr</strong></p>
            <table border="1">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Price (Cr)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="team-${team}-table">
                    ${teamData.players.map((player, index) => `
                        <tr>
                            <td>${player.player}</td>
                            <td>₹${player.price.toFixed(2)} Cr</td>
                            <td><button onclick="removePlayer('${team}', ${index})">Remove</button></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        teamsContainer.appendChild(teamDiv);
    }
}
