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
    //console.log(data);
    if (data.cod === '404' && data.message === 'city not found' ){
      throw new Error('404 city not found');
    }else if (data.cod === 200){
      if (addToList){addSearch()}; // add city to the search list

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
      var oneCallUrl = 'http://api.openweathermap.org/data/2.5/onecall?lat='+data.coord.lat+'&lon='+data.coord.lon;
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
    console.log(weatherData)
    console.log(forecastData)
    printWeather();
  });
}

function printWeather(){
  //this function print the current and forecast weather to the screen
  var todayTitleEl = $('<h5>').text('Todays weather for ' + weatherData.name);
  $('#todaysWeather').append(todayTitleEl);

}


function addSearch(){
  var numChildren = $('#sortable li').length
  console.log(numChildren)
  newLineEl = $('<li>').attr({class:'d-flex justify-content-between ui-state-default'}).text($('#ask').val().trim());
  newLineEl.append($('<span>').attr({class:'ui-icon ui-icon-arrowthick-2-n-s'}));
  newLineEl.append($('<i>').attr({class:'btn btn-danger p-1 fas fa-trash-alt',type:'button'}));
  $('#sortable').append(newLineEl);
  $('#ask').val("");
  //add code here to save the list to local storage
}


// remove item from the sortable list
$('#sortable').on('click', 'i', function(event){
    console.log("Trash Clicked")
    $(event.target).parent().remove()
    //add code here to re-save the list
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

// function for jquery-ui tooltip
$( function() {
    $('#ask').tooltip();
});
// function for jquery-ui sortable list
$( function() {
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
});