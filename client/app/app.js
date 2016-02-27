angular.module('map.services', [])

.factory('Map', function($http,Initializer,$timeout){

  var map;
  var infoWindow
  var markers = [];
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
  var addMarker = function( instance, timeout){
   $timeout(function(){
    var image = {
      //horizontal bee
      //url: 'https://openclipart.org/image/90px/svg_to_png/221154/Cartoon-Bee.png',
      url: 'https://www.ezphotoshare.com/images/2016/02/18/YFq6s.gif',
      // This marker is 41 pixels wide by 61 pixels high.
      size: new google.maps.Size(41, 61),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 61).
      anchor: new google.maps.Point(20.5, 30.5)
    };

    //create a new instance of a google maps marker, will be created for each item in our db
    var marker = new google.maps.Marker({
      position: instance.itemLocation,
      animation: google.maps.Animation.DROP,
      map: this.map,
      icon: image,
      title: 'Hello World!'
    });
    var infoWindow = this.infoWindow;
    markers.push(marker);

    //creates a listener that will attach this instance's data to the global info window and open it
    google.maps.event.addListener(marker, 'click', function(){;
      //turn our mongo-stored stringified date into a JS date obj that is then formatted
      infoWindow.setContent(instance.itemName+' <br><span class="createdAt">'+formatDate(new Date(instance.createdAt))+'</span>');
      infoWindow.open(this.map,this);
    });
  }.bind(this), timeout);
};

  return {
    map: map,
    addMarker: addMarker,
    removeMaker : removeMaker,
    infoWindow: infoWindow,
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
