const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API GET to get all the movie names

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT movie_name as movieName FROM movie ORDER BY movie_id;`;

  const movieNameArray = await db.all(getMovieNamesQuery);
  response.send(movieNameArray);
});

//POST API -Creates a new movie in the movie table

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
  INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES(
      ${directorId},
      '${movieName}',
      '${leadActor}'
  );`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API GET Returns a movie based on the movie ID

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getAMovieDetailsQuery = `
      SELECT movie_id as movieId,
      director_id as directorId,
      movie_name as movieName,
      lead_actor as leadActor FROM 
      movie WHERE movie_id=${movieId};`;

  const movie = await db.get(getAMovieDetailsQuery);
  response.send(movie);
});

//API PUT Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const updateMovieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = updateMovieDetails;

  const updateMovieQuery = `
    UPDATE movie 
    SET 
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API DELETE to delete a specific record

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie 
    WHERE movie_id = ${movieId};`;
  const deleteMovieResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API GET Returns Returns a list of all directors in the director table

app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `
    SELECT director_id as directorId,
    director_name as directorName 
    FROM director ORDER BY director_id;`;

  const directoryInfoArray = await db.all(getAllDirectorQuery);
  response.send(directoryInfoArray);
});

//API GET Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  //console.log(directorId);
  //console.log(request);
  const getMovieByDirectorQuery = `
  SELECT movie_name as movieName
  FROM movie
  WHERE director_id="${directorId}"`;

  const moviesByDirector = await db.all(getMovieByDirectorQuery);
  response.send(moviesByDirector);
});

module.exports = app;
