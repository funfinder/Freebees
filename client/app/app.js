angular.module('map.services', [])


.factory('Map', function($http,Initializer,$timeout,$compile){

  var map;
  var infoWindow;
  var markers =[];
  var filteredItem = [];
  var currentMarker;
  var directionsDisplay;

  /*add a marker to map. Instance needs to be an obj with itemLocation and itemName properties. The last parameter, timeout
is passed in as a parameter to sequentially add each item so the markers drop down sequentially */
  var removeMaker = function()
  {
    for(var i =0;i <markers.length;i++)
    {
      markers[i].setMap(null);
    }
    markers = [];
  }

  return {
    map: map,
    filteredItem : filteredItem,
    markers : markers,
    removeMaker : removeMaker,
    infoWindow: infoWindow,
    directionsDisplay : directionsDisplay,
    currentMarker : currentMarker
  };
});


/*errObj is the object created upon failure. It has a .status prop
exceptionType is a string, could be 'timeout', 'abort', 'error', or others
these two paramaters are automatically accessible within ajax erorr callback*/
var errorHandler = function(errObj, exceptionType){
  var msg = '';
  if(errObj.status === 0){
    msg = 'Not connected. Verify network.';
    console.log('xxxxx this is the error: ', errObj);
  } else if (errObj.status === 404){
    msg = 'Requested page was not found ' + errObj.status;
    console.log('xxxxx this is the error: ', errObj);
  } else if (errObj.status === 500){
    msg = 'Internal server error ' + errObj.status;
    console.log('xxxxx this is the error: ', errObj);
  } else if (exceptionType === 'parserror'){
    msg = 'Requested JSON parse failed';
    console.log('xxxxx this is the error: ', errObj);
  } else if (exceptionType === 'timeout'){
    msg = 'Request timed out';
    console.log('xxxxx this is the error: ', errObj);
  } else if (exceptionType === 'abort'){
    msg = 'Request was aborted';
    console.log('xxxxx this is the error: ', errObj);
  }
  // add error message to top of html's body
  $('body').prepend('<h1>' + msg + '</h1>');
};

// //grab the address the client has typed in to send to turn into longitude/latitude
// var geocodeAddress = function(geocoder, resultsMap, address, cb){
//   //calls the geocode method on Google Map's geocode obj
//   geocoder.geocode({'address': address}, function(results, status){
//     //if successful conversion, return the result in a cb
//     if (status === google.maps.GeocoderStatus.OK){
//       cb(results[0].geometry.location);
//     } else {
//       console.log("Geocode was not successful for the following reason: " + status);
//     }
//   });
// };

var formatDate = function(dateObj){
  var month = dateObj.getMonth() + 1;
  var day = dateObj.getDate();
  var year = dateObj.getFullYear().toString().slice(2);
  return month + '/' + day + '/' + year;
};



var startSpinner = function(){
  $('.spinner img').css('visibility', 'visible');
};

var stopSpinner = function(){
  $('.spinner img').css('visibility', 'hidden');
};
