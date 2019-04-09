var app = angular.module('angularjsNodejsTutorial', []);

// Controller of login-container in login.html
app.controller('loginController', function($scope, $http) {
  $scope.verifyLogin = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);

    var request = $http({
      url: '/login',
      method: "POST",
      data: {
        'username': $scope.username,
        'password': $scope.password
      }
    })

    request.success(function(response) {
      // success
      console.log(response);
      if (response.result === "success") {
        // After you've written the INSERT query in routes/index.js, uncomment the following line
        window.location.href = "http://localhost:8081/dashboard"
      }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });

  };
});

// Controller of user-container in dashboard.html
app.controller('usersController', function($scope, $http) {
  $scope.showUsers = function() {
    var request = $http({
      url: '/showAllUsers',
      method: "GET",
      data: {}
    });
    request.success(function(response){
      // asign the query result to the table cells of the users
      $scope.users = response;
      // make the table visible
      $scope.whetherShowUsers = true;
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
  };
});


// Controller of movie-container in dashboard.html
app.controller('movieController', function($scope, $http) {
  // function to show all genres
  $scope.showGenres = function() {
    var request = $http({
      url: '/showAllGenres',
      method: "GET",
      data: {}
    });
    request.success(function(response){
      // asign the query result to the list of genres
      $scope.genres = response;
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
  };
  // function to show top movies by genre
  $scope.showMovies = function(genre){
    var request = $http({
      url: '/showTopMovies/' + genre,
      method: "GET"
    });
    request.success(function(response){
      // assign the genre name
      $scope.genre = genre;
      // assig the top 10 movies to the table cells of top movies within the genre
      $scope.topMovies = response.slice( 0, Math.min(response.length,10) );
      // make the table visible
      $scope.whetherShowMovies = true;
    }); 
    request.error(function(err){
      console.log("show top movie by genre error: ", err);
    }); 
  };
});

// controller of reco-container in Recommendations.html
app.controller('recoController', function($scope, $http) {
  $scope.reco = function() {
    console.log($scope.movieId);
    // var request = $http({
    //   url: '/reco/' + $scope.movieId,
    //   method: "GET"
    // })
    // request.success(function(response) {
    //   console.log(response);
    //   $scope.whetherShowReco = true;
    //   $scope.recoResults = response;
    // });
    // request.error(function(err) {
    //   console.log("recommendation error: ", err);
    // });
    var request = $http({
      url: '/reco2/' + $scope.movieId,
      method: "GET"
    })
    request.success(function(response) {
      $scope.whetherShowReco = true;
      console.log("response test:", response[0].title, response[0].title === 'no matching movie found')
      if(response[0].title === 'no matching movie found'){
        $scope.recoResults = response;
      }
      else{
        var TOTAL = 10;
        var resLen = response.length;
        var movieCount = 0;
        var genreCount = 1;
        var result = [];       
        var selectedMovieId = new Set();
        var firstGenreIndex = [];
        firstGenreIndex.push(0);
        for(var i = 1; i < resLen - 1; i++){
          if(response[i-1].genre !== response[i].genre){
            firstGenreIndex.push(i);
            genreCount++;
          }
        }
        console.log("resLen:",resLen,"firstGenreIndex:",firstGenreIndex,"genreCount:",genreCount);
        // add each genre
        for(var i = 0; i < Math.min(genreCount,TOTAL); i++){
          var j = firstGenreIndex[i];
          var indexLimit = resLen;
          if(i < genreCount - 1){
            indexLimit = firstGenreIndex[i+1];
          }
          while( j < indexLimit && selectedMovieId.has(response[j].id) ){
            j++;
          }
          if(j < indexLimit){
            result.push(response[j]);
            selectedMovieId.add(response[j].id)
            movieCount++;
            console.log(movieCount,response[j],selectedMovieId);
          }
        }
        // add up to TOTAL number of movies
        console.log(movieCount,TOTAL)
        var j = 0;
        while(movieCount < TOTAL){
          // TODO
          while(j < resLen && selectedMovieId.has(response[j].id)){
            j++;
          }
          if(j < resLen){
            result.push(response[j]);
            selectedMovieId.add(response[j].id)
            movieCount++;
            console.log(movieCount,response[j],selectedMovieId);
          }
          console.log("one iter");
        }  
        // while( movieCount < Math.min(TOTAL,resLen) ){
        //   // add each genre
        //   for(var i = 0; i < genreCount; i++){
        //     var j = firstGenreIndex[i];
        //     var indexLimit = resLen;
        //     if(i < genreCount - 1){
        //       indexLimit = firstGenreIndex[i+1];
        //     }
        //     while( j < indexLimit && selectedMovieId.has(response[j].id) ){
        //       j++;
        //     }
        //     if(j < indexLimit){
        //       result.push(response[j]);
        //       selectedMovieId.add(response[j].id)
        //       movieCount++;
        //       console.log(movieCount,response[j],selectedMovieId);
        //     }
        //   }
        //   // add up to TOTAL number of movies required
        //   for(var i = 0; i < resLen; i++){
        //     if(!selectedMovieId.has(response[i].id)){
        //       result.push(response[i]);
        //       selectedMovieId.add(response[i].id)
        //       movieCount++;
        //       console.log(movieCount,response[j],selectedMovieId);
        //     }
        //   }
        // }
        // result = result.sort(function(a,b){return (a.genre > b.genre);});
        console.log(result);
        $scope.recoResults = result;
      }
    });
    request.error(function(err) {
      console.log("recommendation error: ", err);
    });
  };
});

// controller of bestof-container in bestof.html
app.controller('bestofController', function($scope, $http) {
  $scope.years = Array(18).fill(2000).map((x, y) => x + y);
  $scope.bestof = function() {
    console.log($scope.year);
    var request = $http({
      url: '/bestof/' + $scope.year,
      method: "GET"
    })
    request.success(function(response) {
      $scope.whetherShow = true;
      $scope.results = response;
      console.log('res len = ',response.length);
    });
    request.error(function(err) {
      console.log("bestof error: ", err);
    });
  };
});

// controller of poster-container in posters.html
app.controller('posterController', function($scope, $http) {
  // $scope.results = Array(20).fill(1).map((x, y) => x + y);
  $scope.showPosters = function() {
    var results = []
    var ranNum = 10 + Math.floor(6 * Math.random());
    var apikey = "91ba065c"; // "91ba065c" "d243dbeb"
    var request = $http({
      url: '/random/' + ranNum,
      method: "GET"
    });
    request.success(function(response) {
      for(var i = 0; i < response.length; i++){
        console.log(response[i].imdb_id);
        var req = $http({
          url: "http://www.omdbapi.com/?i=" + response[i].imdb_id + "&apikey=" + apikey,
          method: "GET"
        });
        req.success(function(res){
          // clean N/A Website
          if( res.Website == "N/A" || res.Website.length < 4 || res.Website.substring(0,4) != "http" ){
            res.Website = "javascript:void(0);"; // "#null";
            res.target = "_self";
          }
          else{
            res.target = "_blank";
          }
          console.log("single request:\n", res);
          results.push(res);
        });
        req.error(function(err) {
          console.log(" inner request error: ", err);
        });
      }
      $scope.results = results;
    });
    request.error(function(err) {
      console.log("poster error: ", err);
    });
    // for (var i = 0; i < 7; i++){
    //   results.push({
    //     Title: "An American Tail",
    //     Poster: "https://m.media-amazon.com/images/M/MV5BMjEwMzYxMzY2Nl5BMl5BanBnXkFtZTcwNjQ0NjQyMQ@@._V1_SX300.jpg",
    //     Website: "http://www.omdbapi.com/",
    //     target: "_blank"
    //   });
    //   results.push({
    //     Title: "The Hot Flashes",
    //     Poster: "https://m.media-amazon.com/images/M/MV5BMjQ4OTM5NDk3NV5BMl5BanBnXkFtZTcwNDY1NTk1OQ@@._V1_SX300.jpg",
    //     Website: "javascript:",
    //     target: "_self"
    //   });
    // }
    // $scope.results = results;
    
  };
});

// Template for adding a controller
/*
app.controller('dummyController', function($scope, $http) {
  // normal variables
  var dummyVar1 = 'abc';

  // Angular scope variables
  $scope.dummyVar2 = 'abc';

  // Angular function
  $scope.dummyFunction = function() {

  };
});
*/
