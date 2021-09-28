var weatherUrl;// = 'https://api.openweathermap.org/data/2.5/weather?q=melbourne,au&units=metric';
var onecallUrl;// = 'http://api.openweathermap.org/data/2.5/onecall?lat=-34.9333&lon=138.6';
var appId = '&APPID=4cab6e04384fe42206d2408288ba4120'
var searchStr;
var weatherData;
var forecastData;


// Fetch the current weather from a city
function getWeather(addToList){ 
    //clear the screen and activate the loader..
  searchWait();

  fetch(weatherUrl+appId)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    if (data.cod === '404' && data.message === 'city not found' ){
      throw new Error('404 city not found');
    }else if (data.cod === 200){
      // add city to the search list
      if (addToList){
        addSearch($('#ask').val().trim())
        saveList();
      }; 

      // do something with data
      weatherData = data;
      return data;
    }
  })
  .catch(function (error){
    printError(error);// add code for wron city
  })
  .then(function(data){
      //setup and call OneCall
      var oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+data.coord.lat+'&lon='+data.coord.lon+'&units=metric';
      getOneCallData(oneCallUrl);
  })

}

// Fetch the OneCall weather data after receiving the Weather
function getOneCallData(oneCallUrl){
  //Fetch onecall
  fetch(oneCallUrl+appId)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    forecastData = data
    printWeather();
  });
}
// Display the error if required
function printError(error){
  $('#results').text('');
  $('#results').append($('<h3>').attr({class:'text-center my-5 text-danger'}).text('Oops, that city was not found'));
  $('#results').append($('<h5>').attr({class:'text-center my-5'}).text('Check spelling and try again'));
  $('#ask').val('');
}

//Claer all of the search boxes. activate loader if 'loader' true;
function searchWait(){
    $('#results').text('');
    $('#results').append($('<h3>').attr({class:'text-center my-5'}).text('Searching for ' + searchStr));
    $('#results').append($('<div>').attr({class:'loader'}));
}
//Print the weather to the screen after it has been fetched.
function printWeather(){
  //this function prints the current and forecast weather to the screen
  //bgArr is for the UV index colours
  var bgArr = [
    {textCol: 'black', color:'green',rangeHigh:3, warn:'Low'}, 
    {textCol: 'black',color:'yellow', rangeHigh:6, warn:'Medium' }, 
    {textCol: 'black',color:'darkorange',rangeHigh:8, warn:'High'},
    {textCol: 'white',color:'red',rangeHigh:11, warn:'Very High'},
    {textCol: 'white',color:'purple',rangeHigh:12, warn:'Extreme'},
  ]
  var uvIndex = forecastData.current.uvi;
  var uvArrIndex=4; //default UV array index value (extreme)
  for (var i = 0;i < 4; i++){
    if (uvIndex < bgArr[i].rangeHigh) { 
      var uvArrIndex=i;
      i = 4;
    }
  }
  $('#results').text(''); //Clear the results section
  var todaysWeather = $('<div>').attr({class:'my-3 mx-1',id:'todaysWeather'});
  var forecastWrapper = $('<div>').attr({class:'d-flex flex-wrap',id:'forecastWrapper'});
  //get the time and time offset
  var weatherDate = moment.unix(weatherData.dt).utc().utcOffset(weatherData.timezone/60).format('D-M-YYYY');
  var todayTitleEl = $('<h3>').attr({class:'p-2 m-0'}).text('Current weather for ' + weatherData.name + ' ' + weatherDate);
  var iconElSpan = $('<span>');
  var iconEl = $('<img>').attr({src:'https://openweathermap.org/img/wn/'+ weatherData.weather[0].icon + '@2x.png'});
  var descEl = $('<h5>').attr({class:'p-2'}).text('Weather: ' + capitalise(weatherData.weather[0].description));
  var tempEl = $('<h5>').attr({class:'p-2'}).text('Temperature: ' + weatherData.main.temp + "\xB0C");
  var windEl = $('<h5>').attr({class:'p-2'}).text('Wind speed: ' + weatherData.wind.speed + " km/h")
  var humidityEl = $('<h5>').attr({class:'p-2'}).text('Humidity: ' + weatherData.main.humidity + "%")
  var uviEl = $('<h5>').attr({class:'p-2'})
  var uviElSpan = $('<span>').attr({class:'px-2 rounded', style:'color:'+bgArr[uvArrIndex].textCol + ';background-color:'+bgArr[uvArrIndex].color}).text('UV Index: ' + uvIndex+' '+bgArr[uvArrIndex].warn);
  uviEl.append(uviElSpan);
  iconElSpan.append(iconEl);
  todayTitleEl.append(iconElSpan);
  todaysWeather.append(todayTitleEl);
  todaysWeather.append(descEl);
  todaysWeather.append(tempEl);
  todaysWeather.append(windEl);
  todaysWeather.append(humidityEl);
  todaysWeather.append(uviEl);
  // 5 day forecast
  $('#forecastWrapper').text('') // clear the wrapper
  for (var i = 1; i < 6; i++){
    weatherDate = moment.unix(forecastData.daily[i].dt).utc().utcOffset(weatherData.timezone/60).format('D-M-YYYY');
    var day = $('<div>').attr({class:'col-12 col-md border m-1 p-1'});
    var dateEl = $('<h5>').attr({class:'text-center'}).text(weatherDate);
    var iconElUrl = 'https://openweathermap.org/img/wn/' + forecastData.daily[i].weather[0].icon + '.png';
    iconEl = $('<img>').attr({src:iconElUrl,id:'forecastIcon', class:'justify-content-center'});
    descEl = $('<p>').text(capitalise(forecastData.daily[i].weather[0].description));
    var tempMinEl =$('<p>').text('Min: ' + Math.round(forecastData.daily[i].temp.min)+ "\xB0C");
    var tempMaxEl =$('<p>').text('Max: ' + Math.round(forecastData.daily[i].temp.max)+ "\xB0C");
    windEl =$('<p>').text('Wind: ' + forecastData.daily[i].wind_speed + 'km/h');
    humidityEl = $('<p>').text('Humidity: ' + forecastData.daily[i].humidity+'%')
    day.append(dateEl);
    day.append(iconEl);
    day.append(descEl);
    day.append(tempMinEl);
    day.append(tempMaxEl);
    day.append(windEl);
    day.append(humidityEl);
    forecastWrapper.append(day);
  }
  $('#results').append(todaysWeather);
  $('#results').append($('<h5>').text('5 Day Forecast'));
  $('#results').append(forecastWrapper);
}
//Add a new item to the sortable list
function addSearch(itemText){
  newLineEl = $('<li>').attr({class:'d-flex justify-content-between ui-state-default'}).text(itemText);
  newLineEl.append($('<span>').attr({class:'ui-icon ui-icon-arrowthick-2-n-s'}));
  newLineEl.append($('<i>').attr({class:'btn btn-danger p-1 far fa-trash-alt',type:'button'}));
  $('#sortable').append(newLineEl);
  $('#ask').val("");
}
//Save the sortabel list to local storage
function saveList(){
  var listArr = [];
    for (var i = 0; i < $('#sortable li').length; i++){
      listArr[i] = $('#sortable li:nth-child('+ (i+1) +')').text().trim();
    }
  localStorage.setItem('CityList', JSON.stringify(listArr));
}
//Load the sortable list from local Storage
function loadList(){
  $('#sortable').text(''); //clear the sortable list
  var listArr = JSON.parse(localStorage.getItem('CityList')) //get the data from local storage
  if(listArr) { // confirm the list is not null
    for (var i = 0; i < listArr.length; i++){
      addSearch(listArr[i]);
    }
  }
}
//Capitalise the weather
function capitalise(string){
  string = string.replace(/\b\w/g, function(j){return j.toUpperCase()});
  return string;
}

// remove item from the sortable list
$('#sortable').on('click', 'i', function(event){
    $(event.target).parent().remove()
    saveList();
})

//Check if there was a click event on the sortable list
$('#sortable').on('click', 'li', function(event){
  if (!$(event.target).is('li')){
    return
  }
  searchStr = $(event.target).text().trim()
  weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q='+searchStr+'&units=metric';
  getWeather(false);
})
// Search button was clicked
$('.form-group').on('submit', function(event){
  event.preventDefault();
  if (!$('#ask').val().trim()){
    alert('You need to enter a city to search')
    return
  }
  searchStr = $('#ask').val().trim()
  weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q='+searchStr+'&units=metric';
  getWeather(true);
})
// function for jquery-ui tooltip
$( function() {
    $('#ask').tooltip();
    $("#ask").tooltip({
      position: {
        my: "center bottom",
        at: "right top"
      }
    });
});
// function for jquery-ui sortable list
$( function() {
  $( "#sortable" ).sortable();
  $( "#sortable" ).sortable({cursor: 'move'});
  $( "#sortable" ).sortable({update: function(event, ui) {saveList()}});
  $( "#sortable" ).disableSelection();
});

//Initial load of sortable list
loadList(); 
