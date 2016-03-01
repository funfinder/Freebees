angular.module('GoogleMapsInitializer',[])
//Initializer for google API
.factory('Initializer', function($window, $q) {
  // maps loader deferred object
  var mapsDefer = $q.defer();

  // Google's url for async maps initialization accepting callback function
  var asyncUrl = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAmI2fzx6riKLbgeFlIBvbaXrttPrZrqVI&libraries=places&callback=';

  // async loader
  var asyncLoad = function(asyncUrl, callbackName) {
    var script = document.createElement('script');
    //script.type = 'text/javascript';
    script.src = asyncUrl + callbackName;
    document.body.appendChild(script);
  };

  // callback function - resolving promise after maps successfully loaded
  $window.googleMapsInitialized = function() {
    mapsDefer.resolve();
    console.log('done loading Google Map');
  };

  // loading google maps
  asyncLoad(asyncUrl, 'googleMapsInitialized');

  return {
    // usage: Initializer.mapsInitialized.then(callback)
    mapsInitialized: mapsDefer.promise
  };
})
