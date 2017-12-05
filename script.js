const cities = [
  { name: "Cluj-Napoca",
    url: "clujnapoca.jpg"
  },
  { name: "Berlin",
    url: "berlin.jpg"
  },
  { name: "Bucharest",
    url: "bucharest.jpg"
  },
  { name: "London",
    url: "london.jpg"
  },
  { name: "New York",
    url: "newyork.jpg"
  }
];

const weekDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dailyForecast = [];

const cityList = document.querySelector('ul');
const cityButton = document.querySelector('.city-button');
let backgroundImage = document.querySelector('.photo-container');


function toggleCityList() {
  cityList.classList.toggle("visible");
}

function chooseCity(e) {

  let cityNameTarget = e.target.innerHTML;
  let requiredCity = cities.filter((elem) => elem.name === cityNameTarget);
  let cityNameText = document.querySelector('h4');
  let weekItemContainers = document.querySelectorAll('.week-item');

  backgroundImage.style.backgroundImage = `url('${requiredCity[0].url}')`;
  cityNameText.innerHTML = requiredCity[0].name;

  // clean the view and display the weather info
  for (item of weekItemContainers) {
    item.outerHTML = '';
  }
  showInfoForCity(cityNameTarget);
}

function insertHtmlElement(parentElement, tagName, className) {
  let newElement = document.createElement(tagName);
  newElement.className = className;
  parentElement.appendChild(newElement);
  return {
    newElement : newElement,
    parentElement : parentElement
  }
}

function showInfoForCity(city) {
  fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=fbba44475f0c7199949d7e172d54ef98&units=metric`)
    .then(
      function(response) {
        if (response.status !== 200) {
          alert("Could not process request.");
          return;
        }
        response.json().then(function(data) {

          let classNameFormat;
          let degreesElement = document.querySelector('h1');
          let weatherConditionElement = document.querySelector('.condition');

          const currentDay = data.list[0].dt_txt.substring(8, 10); // e.g. "08"
          let info = getAverageInfoForDay(currentDay, data.list);

          // main weather info shown on screen
          weatherConditionElement.innerHTML = '';
          degreesElement.innerHTML = `${Math.round(info.averageTemperature)}&deg;`;

          classNameFormat = formatClassName(info.averageWeather);
          let finalFormat = `wi wi-day-${classNameFormat.toLowerCase()}`;

          let newContainer = insertHtmlElement(weatherConditionElement, 'i', finalFormat);
          //let newIcon = document.createElement('i');


          //newIcon.className = `wi wi-day-${classNameFormat.toLowerCase()}`;
          //weatherConditionElement.appendChild(newIcon);
          weatherConditionElement.innerHTML += classNameFormat;

          // bottom left for current day
          let parent = document.querySelector('.first-week-item');
          let child = document.querySelector('.left');

          if (document.querySelector('.big-icon') !== null) {
            document.querySelector('.big-icon').outerHTML = '';
          }
          let newChild = document.createElement('i');

          newChild.className = `wi wi-day-${classNameFormat.toLowerCase()} big-icon`;
          parent.insertBefore(newChild, child);

          let degreesBottom = document.querySelector('h2');
          if (degreesBottom.innerHTML !== '') { degreesBottom.innerHTML = ''; }
          degreesBottom.innerHTML = `${Math.round(info.averageTemperature)}&deg;`;

          if (document.querySelector('.bottom-weather') !== null) {
            document.querySelector('.bottom-weather').outerHTML = '';
          }
          let weatherBottom = document.createElement('p');
          weatherBottom.className = 'bottom-weather';
          weatherBottom.innerHTML = classNameFormat;
          child.appendChild(weatherBottom);

          for(let i = 0; i < info.filteredDay.length; i++) {
            data.list.shift();
          }

          // rest of the days
          while (data.list.length > 0) {
              let nextWeekDay = data.list[0].dt_txt.substring(8,10); // get the day e.g. "09"
              let infoNextDay = getAverageInfoForDay(nextWeekDay, data.list);

              // render the elements on page
              let date = data.list[0].dt_txt.substring(0,10);

              let weekItem = document.createElement('div');
              weekItem.className = 'week-item';
              let dayElement = document.createElement('div');
              dayElement.className = 'weekday';

              if (document.querySelector('.week-item') === null) {
                dayElement.innerHTML = 'Tomorrow';
              }
              else {
                let firstThreeLetters = getDayOfWeek(date).substring(0,3);
                dayElement.innerHTML = firstThreeLetters;
              }
              weekItem.appendChild(dayElement);
              let iconElement = document.createElement('i');
              classNameFormat = formatClassName(infoNextDay.averageWeather);

              iconElement.className = `wi wi-day-${classNameFormat.toLowerCase()} blue`;
              weekItem.appendChild(iconElement);
              let newDegreeElement = document.createElement('div');
              newDegreeElement.innerHTML = `${Math.round(infoNextDay.averageTemperature)}&deg;`;
              weekItem.appendChild(newDegreeElement);

              let parentElement = document.querySelector('.week-container');
              parentElement.appendChild(weekItem);

              // remove the info about the previous day
              for(let i = 0; i < infoNextDay.filteredDay.length; i++) {
                data.list.shift();
              }
          }

        });
      }
  )
}


// helper function(s)
function getAverageInfoForDay(day, list) {
  let filteredDay = list.filter( (elem) => {
    let requiredDay = elem.dt_txt.substring(8,10);
    return requiredDay === day;
  });

  let temp = filteredDay.reduce( (acc, curr) => acc + curr.main.temp_max, 0);
  let averageTemperature = temp / filteredDay.length;

  let weatherList = filteredDay.map((e) => { return e.weather[0].main});
  let averageWeather = getMostOccurrences(weatherList);

  return {
    averageTemperature : averageTemperature,
    averageWeather : averageWeather,
    filteredDay : filteredDay
  }
}

function formatClassName( name ) {

  if (name === "Clouds") {
    return "Cloudy";
  }
  else if (name === "Clear") {
    return "Sunny";
  }
  else {
    return name;
  }
}

function getMostOccurrences( list ) {
  let nrOfOccurrences = {};
  let max = 1;
  let res;
  for ( let i = 0; i < list.length; i++ ) {
  	if ( nrOfOccurrences[list[i]] == null ) {
    	nrOfOccurrences[list[i]] = 1;
    }
    else nrOfOccurrences[list[i]]++;
    if (nrOfOccurrences[list[i]] > max) {
    	res = list[i];
      max = nrOfOccurrences[list[i]];
    }
  }
  return res;
}

// returns the day of week for date with format '2017-09-08'
function getDayOfWeek(date) {
  let dayOfWeek = new Date(date).getDay();
  return weekDay[dayOfWeek];
}

/// EVENT LISTENERS
showInfoForCity("Cluj-Napoca");  // default

cityList.addEventListener('click', chooseCity, false);
cityButton.addEventListener("click", toggleCityList);
