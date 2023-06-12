
const apiKey = '629f08a06f60d1d0e8e556168eb74ad6';

let randomMovieGenerated = false;
let answer;
let answerId;
let answerYear;
let answerActors;
let answerDirector;
let answerImage;
let guessCounter = 0;

async function searchMovie(query) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    const response = await fetch(url);
    const data = await response.json();
    const results = data.results;

    // Process the results or return them
    return results;
  } catch (error) {
    console.error('Error searching for movies:', error);
    throw error;
  }
}

// Generate random movie on page load
window.addEventListener('load', () => {
  randomMovie()
});

// Get input variables
const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("search-input");
const detailsBox = document.querySelector('.game_table_row');
const guessNames = document.querySelector('.guess-name');
const guessYears = document.querySelector('.guess-year');
const guessDirectors = document.querySelector('.guess-directors');
const guessActors = document.querySelector('.guess-actors');
const guessGenres = document.querySelector('.guess-genres');
const playButton = document.querySelector('.play-again');
const playButton2 = document.querySelector('.play-again2');
const guessCount = document.querySelector('.guess-counter');

inputBox.onkeyup = function(){
    let result = [];
    let input = inputBox.value;
    if(input.length){
        searchMovie(input)
        .then( result => {
            display(result);
        })
        .catch(error => {
            console.log(error);
        });
    } else {
        resultsBox.innerHTML = "";
    }
};

function display(result) {
  const content = result.map(movie => {
    const { id, title, poster_path, release_date } = movie;
    const imageUrl = poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : 'placeholder.jpg';
    const year = release_date ? release_date.substring(0, 4) : 'N/A';

    return `<li movie-id="${id}" image="${imageUrl}" year="${year}">${title}</li>`;
  }).join('');

  resultsBox.innerHTML = "<ul>" + content + "</ul>";

  const liElements = resultsBox.querySelectorAll("li");
  liElements.forEach(li => {
    li.addEventListener("click", () => {
      guessCounter++;
      //Incorrect event handler
      if (guessCounter == 10) {
        document.getElementById('popup-movie-name2').textContent = answer;
        document.getElementById('popup-movie-image2').src = answerImage;

        const popup = document.getElementById('incorrect-popup');
        popup.classList.add('show-popup');
      }
      //Guess count handler
      guessCount.innerHTML = `<div> Guess Number: ${guessCounter} out of 10</div>`;

      const movieId = li.getAttribute('movie-id');
      const image = li.getAttribute('image');
      const year = li.getAttribute('year');


      getMovieDetails(movieId)
        .then(movieDetails => {
          const { title, director, actors, genres } = movieDetails;

          console.log("answer: ", answer);
          if(title == answer){
            correct(answer, image);
          }
          else {

            // Create a cell element for the names
            const guessName = document.createElement('div');
            guessName.innerHTML = ` <div class="cell_data">${title}</div>`;
            guessNames.appendChild(guessName);
            
            // Create a cell element for the year
            const guessYear = document.createElement('div');
            guessYear.innerHTML = `<div class="cell_data">${year}</div>`;

            // Turn year string elements to ints
            answerYearInt = parseInt(answerYear);
            yearInt = parseInt(year);

            if (answerYearInt > yearInt) {
              guessYear.innerHTML = `<div class="cell_data">${year} <div><i class="fa-solid fa-arrow-up"></i></div></div>`;
            } else {
              guessYear.innerHTML = `<div class="cell_data">${year} <div><i class="fa-sharp fa-solid fa-arrow-down"></i></div></div>`;
            }
            if (yearInt == answerYearInt) {
              guessYear.innerHTML = `<div class="cell_data_green">${year}</div>`;
            } else if ((answerYearInt + 11) > yearInt && yearInt > (answerYearInt - 11)) {
              if (answerYearInt > yearInt) {
                guessYear.innerHTML = `<div class="cell_data_yellow">${year} <div><i class="fa-solid fa-arrow-up"></i></div></div>`;
              } else {
                guessYear.innerHTML = `<div class="cell_data_yellow">${year} <div><i class="fa-sharp fa-solid fa-arrow-down"></i></div></div>`;
              }
            }
            guessYears.appendChild(guessYear);

            // Work on directors
            const guessDirector = document.createElement('div');
            guessDirector.innerHTML = `<div class="cell_data">${director}</div>`;
            if (director == answerDirector) {
              guessDirector.innerHTML = `<div class="cell_data_green">${director}</div>`;
            }
            guessDirectors.appendChild(guessDirector);
            
            //Work on Actor
            const guessActor = document.createElement('div');
            guessActor.innerHTML = `<div class="cell_data">${actors.slice(0, 3).join(', ')}</div>`;
            let matches = [];
            let found = false;
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++){
                if (actors[i] == answerActors[j]) {
                  matches.push(actors[i]);
                  found = true;
                }
              }
            }
            if (found) {
              guessActor.innerHTML = `<div class="cell_data_green">${matches.join(', ')}</div>`;
            }
            
            guessActors.appendChild(guessActor);

            //work on Genres
            const guessGenre = document.createElement('div');
            guessGenre.innerHTML = `<div class="cell_data">${genres.slice(0, 1 ).join(', ')}</div>`;
            
            if (genres.slice(0, 1)[0] == answerGenres[0]) {
              guessGenre.innerHTML = `<div class="cell_data_green">${genres.slice(0, 1 ).join(', ')}</div>`;
            }
            guessGenres.appendChild(guessGenre);

          }
          
        })
        .catch(error => {
          console.log('Error fetching movie details:', error);
        });
    });
  });
}

function correct(name, image) {
    // Set movie name and image in the pop-up
    document.getElementById('popup-movie-name').textContent = name;
    document.getElementById('popup-movie-image').src = image;
  
    // Show the pop-up
    const popup = document.getElementById('popup');
    popup.classList.add('show-popup');
  
    // Optional: Hide the pop-up after a certain duration
    //setTimeout(() => {
        //popup.classList.remove('show-popup');
   //}, 15000); // 3000 milliseconds = 3 seconds
}

async function getMovieDetails(movieId) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`;

    const response = await fetch(url);
    const data = await response.json();

    const title = data.title;

    const director = data.credits.crew
      .find(person => person.job === 'Director')
      .name;

    const actors = data.credits.cast
      .slice(0, 3) // Get the first 5 actors
      .map(actor => actor.name);

    
    const genreIds = data.genres.map(genre => genre.id);
    const genres = data.genres.map(genre => genre.name);


    return {
      title,
      director,
      actors,
      genres
    };
  } catch (error) {
    throw error;
  }
}

async function randomMovie() {
  try {
    if (!randomMovieGenerated) {
      randomMovieGenerated = true;

      // Get the total number of movies available in the database
      const latestMovieResponse = await fetch(`https://api.themoviedb.org/3/movie/latest?api_key=${apiKey}`);
      const latestMovie = await latestMovieResponse.json();
      const totalMovies = latestMovie.id;

      // Generate a random movie ID between 1 and the total number of movies
      const randomInt = Math.floor(Math.random() * 200) + 1;

      // Fetch details of the random movie
      const movieDetailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${randomInt}?api_key=${apiKey}`);
      
      if (!movieDetailsResponse.ok) {
        // Re-roll
        location.reload();
      }
      const movieDetails = await movieDetailsResponse.json();

      answer = movieDetails.title;
      let answerPoster = movieDetails.poster_path;
      answerImage = answerPoster ? `https://image.tmdb.org/t/p/w500${answerPoster}` : 'placeholder.jpg';
      answerYear = movieDetails.release_date.substring(0, 4);
      answerId = movieDetails.imdb_id;

      getMovieDetails(answerId)
        .then(movieDetails => {
          const {title, director, actors, genres} = movieDetails;
          answerDirector = director;
          answerActors = actors.slice(0, 3);
          answerGenres = genres.slice(0, 1);
        })

     

      return {
        title: movieDetails.title,
        imdbId: movieDetails.imdb_id
      };
    } else {
      return {
        title: answer,
        imdbId: null
      };
    }
  } catch (error) {
    console.log('Error fetching random movie:', error);
    throw error;
  }
}

// Generate random movie on page load
window.addEventListener('load', () => {
  randomMovie()
});

playButton.addEventListener('click', () => {
  location.reload();
})

playButton2.addEventListener('click', () => {
  location.reload();
})

// Open the "How to Play" popup
const howToPlayButton = document.querySelector('.inst');
howToPlayButton.addEventListener('click', function() {
  const popup = document.getElementById('howToPlayPopup');
  popup.classList.add('show-popup');
});

// Close the "How to Play" popup
const closeHowToPlayButton = document.querySelector('#howToPlayPopup button.close');
closeHowToPlayButton.addEventListener('click', function() {
  const popup = document.getElementById('howToPlayPopup');
  popup.classList.remove('show-popup');
});

// Open the "Contact" popup
const contactButton = document.querySelector('.footer button');
contactButton.addEventListener('click', function() {
  const popup = document.getElementById('contactPopup');
  popup.classList.add('show-popup');
});

// Close the "Contact" popup
const closeContactButton = document.querySelector('#contactPopup button.close');
closeContactButton.addEventListener('click', function() {
  const popup = document.getElementById('contactPopup');
  popup.classList.remove('show-popup');
});






