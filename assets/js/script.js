var weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q=melbourne,au&units=metric';
var onecallUrl = 'http://api.openweathermap.org/data/2.5/onecall?lat=-34.9333&lon=138.6';
var appId = '&APPID=4cab6e04384fe42206d2408288ba4120'
var defaultCountry = 'AU'
var searchStr,data;

function getWeather(){
fetch(weatherUrl+appId, {cache: 'reload',})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    if (data.cod === '404' && data.message === 'city not found' ){
      throw new Error('404 city not found');
    }else if (data.cod='200'){
      // function to download onecall
      // call function to populate the sortable list
      addSearch();
      // call function to print weather
    }
  })
  .catch(function (error){
    console.log(error)
  })


//Fetch onecall
  fetch(onecallUrl+appId, {cache: 'reload',})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
  });
}

function addSearch(){
  var numChildren = $('#sortable li').length
  console.log(numChildren)
  newLineEl = $('<li>').attr({class:'d-flex justify-content-between ui-state-default'}).text($('#ask').val().trim());
  newLineEl.append($('<span>').attr({class:'ui-icon ui-icon-arrowthick-2-n-s'}));
  newLineEl.append($('<i>').attr({class:'btn btn-danger p-1 fas fa-trash-alt',type:'button'}));
  $('#sortable').append(newLineEl);
}


// remove item from the sortable list
$('#sortable').on('click', 'i' ,function(event){
  console.log(event.target)
    $(event.target).parent().remove()
})

$('.form-group').on('submit', function(event){
  event.preventDefault();
  if (!$('#ask').val().trim()){
    alert('You need to enter a city to search')
    return
  }

  var searchStr = $('#ask').val().trim()
    //Add in the if statement below if default country is required
  //if (!searchStr.match(',')){
  //  searchStr += "," + defaultCountry
  //}
  console.log(searchStr)
  weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q='+searchStr+'&units=metric';
  getWeather();
  console.log(data);
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