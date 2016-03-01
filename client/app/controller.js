var app = angular.module('myApp', ['map.services', 'ui.router', 'flow', 'GoogleMapsInitializer'])
  /**
   * Configuration for routing using ui-router
   * @param  {$stateProvider} set up for different state for ui-router
   * @param  {$urlRouterProvider} setup for current url routing
   */
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
    //state for index html
      .state('landing', {
        url: '',
        views: {
          'main': {
            templateUrl: "/main/landingPage.html"
          },
          'itemForm@landing': {
            templateUrl: "/main/itemForm.html",
            controller: "InputController"
          }
        }
      })
      .state('map', {
        url: '/map',
        views: {
          'main': {
            templateUrl: "/main/map.html",
            controller: "MapController"
          }
        }
      })
      .state('give', {
        url: '/give',
        views: {
          'main': {
            templateUrl: "/main/give.html"
          },
          'itemForm@give': {
            templateUrl: "/main/itemForm.html",
            controller: "InputController"
          }
        }
      })
  })

/**
 * Map Controller for interact with Map view
 * @param  {$scope} current scope
 * @param  {Map} Factory for Map model
 * @param  {Initializer} Factory for Google API Promise
 * @param  {DBActions} Factory for DB Action
 * @param  {$compile} compiler for adding new dynamic angular element to existing dom
 * @param  {$timeout} Angular settimeout
 * @param  {$state} ui-route state for routing to different state
 */
.controller('MapController', function($scope, Map, Initializer, DBActions, $compile, $timeout,$state) {

  /**
   * Promise to wait for Google API to initialize
   */
  Initializer.mapsInitialized
    .then(function() {
      //setup map to center of SF.
      Map.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.764115, lng: -122.435280 },
        zoom: 12
      });

      //Create Singleton InfoWindow
      Map.infoWindow = new google.maps.InfoWindow();

      //Load all Item form DB
      DBActions.loadAllItems($scope.addMarker);

      //Setup Auto Complete on diriving direction origin textbox
      var input = document.getElementById('origin');
      var options = {};
      $scope.autocomplete = new google.maps.places.Autocomplete(input, options);
      $scope.autocomplete.addListener('place_changed', function() {
        $scope.user.lat = null;
        $scope.user.lng = null;
        $scope.user.location = ''
      });
    });

  /**
   * @param {Array} Array of google marker
   * Remove all exisitng marker. Iterate though the list of google and marker and call setMarker
   */
  $scope.addMarker = function(data) {
    Map.removeMarker();
    for (var i = 0; i < data.length; i++) {
      $scope.setMarker(data[i], i * 30);
    }
  };

  /**
   * @param  {object} containing the object that originate the event
   * Get current marker id and remove item from DB then reload current page.
   */
  $scope.removeItem = function(event) {
    DBActions.removeFromDB({id:event.target.id},function(){
      $state.go($state.current, {}, {reload: true});
    });
  }

  /**
   * @param {object} item object
   * @param {integer} timeout to delay the bin drop time animation
   */
  $scope.setMarker = function(data, timeout) {
    $timeout(function() {
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
        position: data.itemLocation,
        animation: google.maps.Animation.DROP,
        map: Map.map,
        icon: image,
        title: data.itemName
      });

      //push marker to Map Factory marker array for removing purpose.
      Map.markers.push(marker);

      //creates a listener that will attach this instance's data to the global info window and open it
      google.maps.event.addListener(marker, 'click', function(marker) {
        //turn our mongo-stored stringified date into a JS date obj that is then formatted
        if (Map.infoWindow.anchor !== this){
          //create an angular element info window
          var content = '<div><div>' + data.itemName + '</div><br>';
          if (data.image !== '') {
            content += '<img src=http://' + window.location.host + '/' + data.image + ' />';
          }
          content += '<br><button id="'+data._id+'" type="button" ng-click="removeItem($event) " >delete</button><div>';
          var ele = angular.element(content);

          //compile to add the info window to the current scope
          $compile(ele)($scope);

          Map.infoWindow.setContent(ele[0]);
          Map.infoWindow.open(Map.map, this);
        }
       else{
          Map.infoWindow.close();
        }
      });
    }.bind(this), timeout);
  };

  /**
   * add google direction on to the map.
   * @param  {object} the object containing of the starting position latitue and longtitue
   * @param  {string} the method to be search using google map api
   */
  $scope.direction=function(latlngObj, method){
    var origin = latlngObj;
    //if a current direction is displayed then remove the current direction
    if(Map.directionsDisplay){
        Map.directionsDisplay.setMap(null);
    }
    // if no marker is clicked.
    if(!Map.infoWindow.anchor){
        alert("No Marker Selected, Please Select a Marker!");
    }
    else{
        //search position of lat and Lng
        var selectedLocation = {lat: Map.infoWindow.anchor.position.lat() , lng: Map.infoWindow.anchor.position.lng()};
        var mode;
        if(method==="drive"){
            mode=google.maps.TravelMode.DRIVING;
        }
        else if(method==="walk"){
            mode=google.maps.TravelMode.WALKING;
        }
        else if(method==="transit"){
            mode=google.maps.TravelMode.TRANSIT;
        }
        Map.directionsDisplay = new google.maps.DirectionsRenderer({
         map: Map.map
        });

        var request = {
            destination: selectedLocation,
            origin: origin,
            travelMode: mode
        };
        //retrieve google map driving direction.
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            // Display the route on the map.
            Map.directionsDisplay.setDirections(response);
            Map.removeMarker();
        }
      });
    }
  };

  //refish map if search bar is used and new filter item is being updated.
  $scope.$watch(function(){return Map.filteredItem},function(newVal,oldVal){
    if (newVal.length > 0 )
    {
      $scope.addMarker(Map.filteredItem);
    }
  });

  /**
   * Button action for diretion direction
   * @param  {string}
   */
  $scope.getDir=function(method){
    var latlng={};

    if ($scope.user.lng!== null &&$scope.user.lat!==null) {
      latlng = { lat: $scope.user.lat, lng: $scope.user.lng };
      $scope.direction(latlng,method);
    } else if ($scope.autocomplete.getPlace()!== undefined){
      var place = $scope.autocomplete.getPlace();
      latlng = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      $scope.direction(latlng,method);
    }
    else
    {
      alert("You Didn't Enter an Origin Location, Please Enter One to Get Direction!");
    }
};
})

/**
 * @param  {$scope} current scope
 * @param  {Map} Factory for Map model
 * @param  {Initializer} Factory for Google API Promise
 * @param  {DBActions} Factory for DB Action
 * @param  {$state} ui-route state for routing to different state
 */
.controller('InputController', function($scope, Map, Initializer, DBActions, $state) {

  $scope.autocomplete = {};

  //wait for Google Map API and setup autocomplete
  Initializer.mapsInitialized
    .then(function() {
      var input = document.getElementById('inputAddress');
      var options = {};
      $scope.autocomplete = new google.maps.places.Autocomplete(input, options);
      $scope.user.lat = null;
      $scope.user.lng = null;
      $scope.user.location = ''
    });

  /**
   * Send new  item name, location and image to server
   */
  $scope.sendPost = function() {
    //convert inputted item name to lowerCase
    var lowerCaseItem = $scope.user.item;
    //convert inputted address, need to get value with JS bc angular can't detect autocomplete
    //after address converted, save user input item and location to db
    var place = $scope.autocomplete.getPlace();
    var LatLng = {};
    if (place === undefined) {
      LatLng = { lat: $scope.user.lat, lng: $scope.user.lng };
    } else {
      LatLng = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    }
    var query = { item: lowerCaseItem, LatLng: LatLng, createdAt: new Date() };

    // upload image if it's being selected
    if ($scope.uploader.flow.files.length > 0) {
      var reader = new window.FileReader();
      reader.readAsDataURL($scope.uploader.flow.files[0].file);
      reader.onloadend = function() {
        query.image = reader.result;
        DBActions.saveToDB(query, $scope.successCallback);
      };
    } else {
      DBActions.saveToDB(query, $scope.successCallback);
    }
  };

  /**
   * callback function for cleaning up and go to map page when the new item sent to server successfully
   */
  $scope.successCallback = function() {
    if ($scope.uploader.flow.files.length > 0) {
      $scope.uploader.flow.files.shift();
    }
    $scope.clearForm();
    $state.go('map');
  };
})

/**
 * @param  {$scope} current scope
 * @param  {Map} Factory for Map model
 * @param  {DBActions} Factory for DB Action
 * @param  {$state} ui-route state for routing to different state
 */
.controller('FormController', function($scope, DBActions, Map, $state) {
  $scope.user = {};
  $scope.uploader = {};
  $scope.user.lat = null;
  $scope.user.lng = null;

  $scope.clearForm = function() {
    //need a way to clear addresses filled with autocomplete, angular doesn't detect autocomplete as a change in DOM
    $scope.user = {};
    $scope.search = {};
  };

  //define function within this controller to convert a string to lowerCase for standardization
  var convertToLowerCase = function(itemString) {
    return itemString.toLowerCase();
  };

  //this function filters map based on what user enters into filter field
  $scope.filterMap = function() {

    //convert inputted filter item to lowerCase so that matches with lowerCase values stored in db
    //var lowerCaseFilterItem = convertToLowerCase($scope.search.input);
    //var searchInput = lowerCaseFilterItem;

    DBActions.filterDB($scope.search.input, function(data) {
    if ($state.current!=='map')
    {
      $state.go('map');
    }
    $scope.search.input = '';
    $scope.clearForm();

    });
  };

  //fills in the address field with current lat/lng
  $scope.ip = function() {
    startSpinner();
    //check for the HTML5 geolocation feature, supported in most modern browsers
    if (navigator.geolocation) {
      //async request to get users location from positioning hardware
      navigator.geolocation.getCurrentPosition(function(position) {
        //if getCurrentPosition is method successful, returns a coordinates object
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        $scope.user.location = lat + ', ' + long;
        $scope.user.lat = lat;
        $scope.user.lng = long;
        $scope.$digest();
        stopSpinner();
      });
    } else {
      error('Geo Location is not supported');
    }
  };

})

/**
 * @param  {scope} current scope
 * @param  {DBActions} Factory for DB Action
 * @return {[type]}
 */
.controller('DelBtnController',function($scope,DBActions){
  $scope.item = {};

  $scope.deleteItem = function(item){

    DBActions.removeFromDB(item);
  }
})

/**
 * @param  {$http} Angular http request call
 * @param  {Map} Factory for Map model
 */
.factory('DBActions', function($http, Map) {

  /**
   * the 'toSave' parameter is an object that will be entered into database,'toSave' has item prop and LatLng properties
   * @param  {object} item objec to be save to db
   * @param  {Function} callback function for successful save to DB
   */
  var saveToDB = function(toSave, callback) {
    $http.post('/submit', toSave)
      //after item has been saved to db, returned data has a data property
      //so we need to access data.data, see below
      .then(function(data) {
        stopSpinner();
        //data.data has itemName prop, itemLocation prop, and _id prop, which are all expected since this is how
        //our mongoDB is formatted. Anything returned from db should have these props
        callback();
      }, function(err) {
        console.log('Error when saveToDB invoked - post to "/" failed. Error: ', err);
      });
  };


  /**
   * this function creates a new map based on filtering by whatever user enters in filter field
   * it is invoked within $scope.filterMap, see the above controller
   * @param  {string} filter key word
   * @param  {Function} callback function fro filterDB
   */
  var filterDB = function(toFilterBy, callback) {

    //gets everything from the db in an obj referenced as data
    return $http.get('/api/items')
      .then(function(data) {
        callback();
        //filter our returned db by the desired itemName
        var filtered = data.data.filter(function(item) {
          return item.itemName.indexOf(toFilterBy) > -1;
        });
        Map.filteredItem = filtered;

      }, function(err) {
        console.log('Error when filterDB invoked - get from "/api/items" failed. Error: ', err);
      });
  };

  /**
   * remove item from db base on id
   * @param  {integer} item id to be remove from db
   * @param  {Function} callback function when successfully finish removing from db.
   */
  var removeFromDB = function(toRemove,callback) {
    return $http.post('/pickup', toRemove)
      .then(function(data) {
        callback();
      }, function(err) {
        console.log('Error when removeFromDB invoked - post to "/pickup" failed. Error: ', err);
      });
  };
  /**
   * @param  {Function} callback function when load item is complete from server
   */
  var loadAllItems = function(callback) {
    $http.get('/api/items').then(function(result) {
      //loop through data returned from db to place on map
      callback(result.data);
    }, function(jqXHR, exception) {
      errorHandler(jqXHR, exception);
    });
  };

  //the DBActions factory returns the below object with methods of the functions
  //defined above
  return {
    saveToDB: saveToDB,
    filterDB: filterDB,
    removeFromDB: removeFromDB,
    loadAllItems: loadAllItems
  };
});
