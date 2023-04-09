const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`your server code is error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertSnakeCaseToCamel = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  };
};

app.get("/players/", async (request, response) => {
  const getAllBook = `select * from cricket_team order by player_id;`;
  const getAllBookResult = await db.all(getAllBook);
  response.send(getAllBookResult.map((each) => convertSnakeCaseToCamel(each)));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const insertPlayerDetails = `insert into cricket_team (player_name, jersey_number, role)
     values 
     (
         "${playerName}",
         ${jerseyNumber},
         "${role}"
         );`;
  await db.run(insertPlayerDetails);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getOnePersonDetails = `select * from cricket_team where player_id = ${playerId};`;
  const getOnePersonDetailsResult = await db.get(getOnePersonDetails);
  response.send(convertSnakeCaseToCamel(getOnePersonDetailsResult));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatedBook = request.body;
  const { playerName, jerseyNumber, role } = updatedBook;
  const updatedBookDetails = `UPDATE cricket_team
SET player_name = "${playerName}", jersey_number = ${jerseyNumber}, role = "${role}"
WHERE player_id = ${playerId};`;
  await db.run(updatedBookDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteBookDetails = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deleteBookDetails);
  response.send("Player Removed");
});

module.exports = app;
