var express = require('express');
var router = express.Router();
var path = require('path');

// Connect string to MySQL
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'fling.seas.upenn.edu',
  user: 'cadenza',
  password: 'Lzy@199803231900',
  database: 'cadenza'
});

connection.connect(function(err) {
  if (err) {
    console.log("Error Connection to DB" + err);
    return;
  }
  console.log("Connection established...");
});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

router.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

router.get('/Recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

router.get('/Best%20of', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

router.get('/Posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});

// To add a new page, use the templete below
/*
router.get('/routeName', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'fileName.html'));
});
*/

// Login uses POST request
router.post('/login', function(req, res) {
  // use console.log() as print() in case you want to debug, example below:
  // console.log(req.body); will show the print result in your terminal

  // req.body contains the json data sent from the loginController
  // e.g. to get username, use req.body.username
  var query = "INSERT IGNORE INTO User Values('" + req.body.username + "','" + req.body.password + "');"; /* Write your query here and uncomment line 21 in javascripts/app.js*/
  connection.query(query, function(err, rows, fields) {
    // console.log("rows", rows);
    // console.log("fields", fields);
    if (err) console.log('insert error: ', err);
    else {
      res.json({
        result: 'success'
      });
    }
  });
});

// get all the user info
router.get('/showAllUsers', function(req, res) {
  var query = "SELECT DISTINCT * FROM User;"; 
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get user info error: ', err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

// get all the movie genres
router.get('/showAllGenres', function(req, res) {
  var query = "SELECT DISTINCT genre FROM Genres;";
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get genres error: ', err);
    else {
      // console.log(rows);
      res.json(rows);
    }
  });
});

// get top moives by genre 
router.get('/showTopMovies/:genre', function(req, res) {
  console.log("queried genre: ", req.params.genre);
  var query = "SELECT DISTINCT title, rating, vote_count as votes FROM Movies M, Genres G WHERE G.genre='" + req.params.genre + "' AND G.movie_id=M.id ORDER BY rating DESC, votes DESC LIMIT 10;"; 
  connection.query(query, function(err, rows, fields) {
    if (err) console.log('get top movies error: ', err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

// get recommended movies 
router.get('/reco/:movieId', function(req, res) {
  var key = req.params.movieId;
  var results = [];
  var query = "SELECT DISTINCT genre FROM Genres G WHERE G.movie_id=\"" + key + "\";";
  connection.query(query, function(err, genres) {
    if (err) {
      console.log('get recommendations error: ', err);
      res.send({err:err});
    }
    else {
      if (genres.length < 1){
        res.json([{
          title: 'no matching movie found',
          genre: 'n.a.'
        }]);
      }
      else{
        const TOTAL = 10;
        const PRIME = 911;
        var lim = Math.floor( TOTAL / Math.min(genres.length,TOTAL) );
        var lastLim = TOTAL - lim * Math.min(genres.length-1,TOTAL-1);
        var step = Math.floor(PRIME / genres.length);
        // console.log("step is:", step);
        var query2 = "";
        for(var i = 0; i < Math.min(genres.length-1,TOTAL-1); i++){
          query2 += "(" + 
                    "SELECT title, genre " + 
                    "FROM Movies M, Genres G " + 
                    "WHERE M.id=G.movie_id AND M.id<>\"" + key + "\" AND MOD(M.id," + PRIME + ") between " + i*step + " and " +  (i+1)*step + " AND G.genre=\"" + genres[i].genre + "\" " + 
                    "GROUP BY id " + 
                    "LIMIT " + lim + 
                    ") Union ";
        }
        query2 +=   "(" + 
                    "SELECT title, genre " + 
                    "FROM Movies M, Genres G " + 
                    "WHERE M.id=G.movie_id AND M.id<>\"" + key + "\" AND MOD(M.id," + PRIME + ") between " + (genres.length-1)*step + " and " +  PRIME + " AND G.genre=\"" + genres[Math.min(genres.length-1,TOTAL-1)].genre + "\" " + 
                    "GROUP BY id " + 
                    "LIMIT " + lastLim + 
                    ")";
        // var genreList = "(";
        // for(var i = 0; i < genres.length; i++){
        //   genreList += "\"" + genres[i].genre + "\"";
        //   if (i < genres.length - 1)
        //     genreList += ",";
        //   else
        //     genreList += ")"
        // }
        // console.log("genreList is: ", genreList);
        // query2 =  "SELECT id title, genre " + 
        //           "FROM Movies M, Genres G " + 
        //           "WHERE M.id=G.movie_id AND G.genre IN " + genreList + " "+ 
        //           "ORDER BY genre;";
        connection.query(query2, function(err, rows) {
          if (err){
            // res.send({err: err});
            console.log(err);
            res.json([{
              title: 'some error occurred',
              genre: 'n.a.'
            }]);
          }
          // console.log(rows);
          res.json(rows);
        });
      }
    }
  });
});

// get recommended movies 
router.get('/reco2/:movieId', function(req, res) {
  var key = req.params.movieId;
  console.log(key);
  var query = "SELECT DISTINCT id, title, genre " + 
              "FROM Movies M, Genres G " +
              "WHERE M.id=G.movie_id AND M.id<>\"" + key + "\" " + 
              "AND G.genre IN (SELECT DISTINCT genre FROM Genres G WHERE G.movie_id=\"" + key + "\") " + 
              "ORDER BY genre";
  connection.query(query, function(err, rows) {
    if (err) {
      console.log('get recommendations error: ', err);
      res.send({err:err});
    }
    else {
      if (rows.length < 1){
        res.json([{
          id: 'n.a.',
          title: 'no matching movie found',
          genre: 'n.a.'
        }]);
      }
      else{
        console.log(rows[0])
        res.json(rows)
      }
    }
  });
});

// get best of the year
router.get('/bestof/:year', function(req, res) {
  var year = req.params.year;    // if you have a custom parameter
  var query = "SELECT DISTINCT genre, title, MAX(vote_count) as votes " + 
              "FROM Movies M, Genres G " + 
              "WHERE M.id=G.movie_id AND M.release_year=\"" + year + "\" " +  
              "GROUP BY genre;";
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});

// get random imdb_id
router.get('/random/:num', function(req, res) {
  var num = req.params.num;    // if you have a custom parameter
  var query = "SELECT DISTINCT imdb_id " + 
              "FROM Movies " + 
              "ORDER BY RAND()" + 
              "LIMIT " + num + ";";
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("random imdb_ids:\n", rows);
      res.json(rows);
    }
  });
});

// template for GET requests
/*
router.get('/routeName/:customParameter', function(req, res) {

  var myData = req.params.customParameter;    // if you have a custom parameter
  var query = '';

  // console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});
*/

module.exports = router;
