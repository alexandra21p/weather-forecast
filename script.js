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
const btn = document.querySelector('.city-button');
btn.addEventListener("click", toggleCityList);

function toggleCityList() {
  let propValue = window.getComputedStyle(cityList, null).getPropertyValue("display");
  console.log(propValue);
  if (propValue === "block") {
    cityList.style.display = 'none';
  }
  else {
    cityList.style.display = 'block';
  }
}

cityList.addEventListener('click', chooseCity, false);
function chooseCity(e) {
  console.log(e.target, e.target.innerHTML);
  let getCity = cities.filter((elem) => elem.name === e.target.innerHTML);
  console.log(getCity);
  let background = document.querySelector('.photo-container');
  console.log(background);
  background.style.backgroundImage = `url('${getCity[0].url}')`;
  let cityName = document.querySelector('h4');
  cityName.innerHTML = getCity[0].name;

  // display the weather info for corresponding info
  showInfoForCity(e.target.innerHTML);

  // repopulate the city list
  cityList.innerHTML = '';
  let filterCities = cities.filter((el) => el.name !== getCity[0].name);
  filterCities.forEach((city) => {
    let listItem = document.createElement('li');
    listItem.innerHTML = city.name;
    cityList.appendChild(listItem);
  });
}

function showInfoForCity(city) {
  fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=fbba44475f0c7199949d7e172d54ef98&units=metric`)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log("BAD");
          return;
        }
        response.json().then(function(data) {
          console.log(data.city.name);
          console.log(data.list);
          let format;
          let degrees = document.querySelector('h1');
          let weatherCondition = document.querySelector('.condition');

          const currentDay = data.list[0].dt_txt.substring(8,10); // e.g. "08"
          let info = getAverageInfoForDay(currentDay, data.list);
          console.log(info);

          // main weather info shown on screen
          weatherCondition.innerHTML = '';
          degrees.innerHTML = `${Math.round(info.averageTemperature)}&deg;`;
          let newIcon = document.createElement('i');
          if (info.averageWeather === "Clouds") {
            format = info.averageWeather.replace("s", "y");
          }
          else if (info.averageWeather === "Clear") {
            format = "Sunny";
          }
          else {
            format = info.averageWeather;
          }
          newIcon.className = `wi wi-day-${format.toLowerCase()}`;
          console.log(newIcon);
          weatherCondition.appendChild(newIcon);
          weatherCondition.innerHTML += format;

          // bottom left for current day
          let parent = document.querySelector('.first-week-item');
          let child = document.querySelector('.left');
          // if (child.textContent !== '') {
          //   child.textContent = '';
          // }
          console.log("IMPORTANRT STUFF:", document.querySelector('.big-icon') === null);
          if (document.querySelector('.big-icon') !== null) {
            document.querySelector('.big-icon').outerHTML = '';
          }
          let newChild = document.createElement('i');
          //let newChild = document.querySelector('.big-icon');
          if (info.averageWeather === "Clouds") {
            format = info.averageWeather.replace("s", "y");
          }
          else if (info.averageWeather === "Clear") {
            format = "Sunny";
          }
          else {
            format = info.averageWeather;
          }
          newChild.className = `wi wi-day-${format.toLowerCase()} big-icon`;
          parent.insertBefore(newChild, child);

          let degreesBottom = document.querySelector('h2');
          if (degreesBottom.innerHTML !== '') { degreesBottom.innerHTML = ''; }
          degreesBottom.innerHTML = `${Math.round(info.averageTemperature)}&deg;`;
          let weatherBottom = document.createElement('p');
          weatherBottom.innerHTML = format;
          child.appendChild(weatherBottom);

          for(let i = 0; i < info.filterDay.length; i++) {
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
                console.log(date, getDayOfWeek(date), firstThreeLetters);
                dayElement.innerHTML = firstThreeLetters;
              }
              weekItem.appendChild(dayElement);
              let iconElement = document.createElement('i');

              if (infoNextDay.averageWeather === "Clouds") {
                format = infoNextDay.averageWeather.replace("s", "y");
              }
              else if (infoNextDay.averageWeather === "Clear") {
                format = "Sunny";
              }
              else {
                format = infoNextDay.averageWeather;
              }
              iconElement.className = `wi wi-day-${format.toLowerCase()} blue`;
              weekItem.appendChild(iconElement);
              let deg = document.createElement('div');
              deg.innerHTML = `${Math.round(infoNextDay.averageTemperature)}&deg;`;
              weekItem.appendChild(deg);

              let parentElem = document.querySelector('.week-container');
              parentElem.appendChild(weekItem);
              // remove the info about the previous day
              for(let i = 0; i < infoNextDay.filterDay.length; i++) {
                data.list.shift();
              }


          }

          });
        }
  )
}


// helper function(s)
function getAverageInfoForDay(day, list) {
  let filterDay = list.filter( (elem) => {
    let getDay = elem.dt_txt.substring(8,10);
    return getDay === day;
  });
  console.log(filterDay);

  let temp = filterDay.reduce( (acc, curr) => acc + curr.main.temp_max, 0);
  console.log(temp);
  let averageTemperature = temp / filterDay.length;
  console.log(averageTemperature);

  let weatherList = filterDay.map((e) => { return e.weather[0].main});
  console.log(weatherList);
  let averageWeather = getMostOccurrences(weatherList);

  return {
    averageTemperature : averageTemperature,
    averageWeather : averageWeather,
    filterDay : filterDay
  }
}

function getMostOccurrences(list) {
  let nrOfOccurrences = {};
  let max = 1;
  let res;
  for (let i = 0; i < list.length; i++) {
  	if (nrOfOccurrences[list[i]] == null) {
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
