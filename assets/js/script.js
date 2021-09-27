var weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q=melbourne,au&units=metric';
var onecallUrl = 'http://api.openweathermap.org/data/2.5/onecall?lat=-34.9333&lon=138.6';
var appId = '&APPID=4cab6e04384fe42206d2408288ba4120'
var defaultCountry = 'AU'
var searchStr;
var weatherData;
var forecastData;

function getWeather(addToList){
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
    // add code for wron city
    console.log(error)
  })
  .then(function(data){
      //setup and call OneCall
      var oneCallUrl = 'http://api.openweathermap.org/data/2.5/onecall?lat='+data.coord.lat+'&lon='+data.coord.lon+'&units=metric';
      getOneCallData(oneCallUrl);
  })

}
 
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

function printWeather(){
  //this function prints the current and forecast weather to the screen
  $('#todaysWeather').text(""); //clear the children
  console.log(weatherData);
  console.log(forecastData);

  var bgArr = ['green', 'yellow', 'darkorange','red', 'purple']

  var weatherDate = moment.unix(weatherData.dt).utc().utcOffset(weatherData.timezone/60).format('D-M-YYYY');
  var todayTitleEl = $('<h3>').attr({class:'p-2'}).text('Current weather for ' + weatherData.name + ' ' + weatherDate);
  var iconElSpan = $('<span>');
  var iconEl = $('<img>').attr({src:'http://openweathermap.org/img/wn/'+ weatherData.weather[0].icon + '@2x.png'});
  var descEl = $('<h5>').attr({class:'p-2'}).text(weatherData.weather[0].description);
  var tempEl = $('<h5>').attr({class:'p-2'}).text('Temperature ' + weatherData.main.temp + "\xB0C");
  var windEl = $('<h5>').attr({class:'p-2'}).text('Wind speed ' + weatherData.wind.speed + " km/h")
  var humidityEl = $('<h5>').attr({class:'p-2'}).text('Humidity ' + weatherData.main.humidity + "%")
  var uviEl = $('<h5>').attr({class:'p-2'})
  var uviElSpan = $('<span>').attr({class:'px-2 rounded'}).css('background-color',bgArr[Math.round((forecastData.current.uvi-1)/2.8)],).text('UV Index ' + forecastData.current.uvi)
  uviEl.append(uviElSpan);
  iconElSpan.append(iconEl);
  todayTitleEl.append(iconElSpan);
  
  $('#todaysWeather').append(todayTitleEl);
  $('#todaysWeather').append(descEl);
  $('#todaysWeather').append(tempEl);
  $('#todaysWeather').append(windEl);
  $('#todaysWeather').append(humidityEl);
  $('#todaysWeather').append(uviEl);

  // 5 day forecast
  $('#forecastWrapper').text('') // clear the wrapper
  for (var i = 1; i < 6; i++){
    weatherDate = moment.unix(forecastData.daily[i].dt).utc().utcOffset(weatherData.timezone/60).format('D-M-YYYY');
    var day = $('<div>').attr({class:'col-12 col-md border m-1 p-1'});
    var dateEl = $('<h5>').attr({class:'text-center'}).text(weatherDate);
    var iconElUrl = 'http://openweathermap.org/img/wn/' + forecastData.daily[i].weather[0].icon + '.png';
    iconEl = $('<img>').attr({src:iconElUrl,id:'forecastIcon', class:'justify-content-center'});
    descEl = $('<p>').text(forecastData.daily[i].weather[0].description);
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

    $('#forecastWrapper').append(day);

  }
}

function addSearch(itemText){
  newLineEl = $('<li>').attr({class:'d-flex justify-content-between ui-state-default'}).text(itemText);
  newLineEl.append($('<span>').attr({class:'ui-icon ui-icon-arrowthick-2-n-s'}));
  newLineEl.append($('<i>').attr({class:'btn btn-danger p-1 fas fa-trash-alt',type:'button'}));
  $('#sortable').append(newLineEl);
  $('#ask').val("");
}

function saveList(){
  var listArr = [];
    for (var i = 0; i < $('#sortable li').length; i++){
      listArr[i] = $('#sortable li:nth-child('+ (i+1) +')').text().trim();
    }
  localStorage.setItem('CityList', JSON.stringify(listArr));
}

function loadList(){
  $('#sortable').text(''); //clear the sortable list
  var listArr = JSON.parse(localStorage.getItem('CityList')) //get the data from local storage
  if(listArr) { // confirm the list is not null
    for (var i = 0; i < listArr.length; i++){
      addSearch(listArr[i]);
    }
  }
}

loadList();


// remove item from the sortable list
$('#sortable').on('click', 'i', function(event){
    $(event.target).parent().remove()
    saveList();
})

$('#sortable').on('click', 'li', function(event){
  if (!$(event.target).is('li')){
    return
  }
  searchStr = $(event.target).text().trim()
  weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q='+searchStr+'&units=metric';
  getWeather(false);
})




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


$( "#sortable" ).on('click', saveList());

// function for jquery-ui tooltip
$( function() {
    $('#ask').tooltip();
});
// function for jquery-ui sortable list
$( function() {
  $( "#sortable" ).sortable();
  $( "#sortable" ).sortable({cursor: 'move'});
  $( "#sortable" ).sortable({update: function(event, ui) {saveList()}});
  $( "#sortable" ).disableSelection();
});