angular.module('map.services', [])

/**
 * Map Factory being used by multiple controller.
 */
.factory('Map', function(){

  var map;
  var infoWindow;
  var markers =[];
  var filteredItem = [];
  var currentMarker;
  var directionsDisplay;

  /**
   * remove the marker current displayed
   */
  var removeMarker = function()
  {
    for(var i =0;i <this.markers.length;i++)
    {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  };

  return {
    map: map,
    removeMarker : removeMarker,
    filteredItem : filteredItem,
    markers : markers,
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
