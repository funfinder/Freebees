var app = angular.module('myApp', ['map.services', 'ui.router','flow'])
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
          templateUrl: "main/itemForm.html"
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
          templateUrl: "main/itemForm.html"
        }
      }
    })
  })

.controller('MapController', function($scope,Map) {
  Map.showMap();
})


//dependencies injected include DBActions factory and Map factory
.controller('FormController', function($scope, $http, DBActions, Map) {
  $scope.user = {};
  $scope.uploader = {};

  $scope.clearForm = function() {
    //need a way to clear addresses filled with autocomplete, angular doesn't detect autocomplete as a change in DOM
    $scope.user = {};
    $scope.search = {};
  };

  //define function within this controller to convert a string to lowerCase for standardization
  var convertToLowerCase = function(itemString) {
    return itemString.toLowerCase();
  };

  $scope.sendPost = function(image) {
    //convert inputted item name to lowerCase
    var lowerCaseItem = convertToLowerCase($scope.user.item);
    //convert inputted address, need to get value with JS bc angular can't detect autocomplete
    var inputtedAddress = $scope.user.location;
    Map.geocodeAddress(geocoder, Map.map, inputtedAddress, function(converted) {
      //after address converted, save user input item and location to db
      var reader = new window.FileReader();
      //console.log();
      reader.readAsDataURL($scope.uploader.flow.files[0].file);
      reader.onloadend = function() {
        DBActions.saveToDB({ item: lowerCaseItem, LatLng: converted, createdAt: new Date(), image: reader.result });
      };   });
    $scope.clearForm();
  };

  //this function filters map based on what user enters into filter field
  $scope.filterMap = function() {
    uploader.flow.upload();
    //convert inputted filter item to lowerCase so that matches with lowerCase values stored in db
    var lowerCaseFilterItem = convertToLowerCase($scope.search.input);
    var searchInput = lowerCaseFilterItem;
    DBActions.filterDB(searchInput);
    $scope.search.input = '';
    $scope.clearForm();
  };

  //this function retrieves everything from the database and renders a map on page
  //this would happen when user first visits page, when user submits an item, or when user deletes an item
  $scope.initMap = function() {
    Map.loadAllItems();
  };
  //removes a posting from the db and from the map
  $scope.removePost = function() {
    //convert inputted item name to lowerCase to match what's already in db
    var lowerCaseDeleteItem = convertToLowerCase($scope.user.item);
    //convert inputted address
    var inputtedAddress = document.getElementById('inputAddress').value;
    Map.geocodeAddress(geocoder, Map.map, inputtedAddress, function(converted) {
      DBActions.removeFromDB({ item: lowerCaseDeleteItem, LatLng: converted });
    });
    $scope.clearForm();
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
        $scope.$digest();

        stopSpinner();
      });
    } else {
      error('Geo Location is not supported');
    }
  };
  // $scope.clearForm();

})

.factory('DBActions', function($http, Map) {
  //the 'toSave' parameter is an object that will be entered into database,
  //'toSave' has item prop and LatLng properties
  var saveToDB = function(toSave) {
    return $http.post('/submit', toSave)

    //after item has been saved to db, returned data has a data property
    //so we need to access data.data, see below
    .then(function(data) {
      stopSpinner();
      //data.data has itemName prop, itemLocation prop, and _id prop, which are all expected since this is how
      //our mongoDB is formatted. Anything returned from db should have these props
      Map.addMarker(map, data.data, infoWindow);
      //the 'map' argument here is referencing the global map declared in app.js
      //this could be manipulated in chrome console by user. Future refactor could be to store
      //map within Map factory instead of global space.
    }, function(err) {
      console.log('Error when saveToDB invoked - post to "/" failed. Error: ', err);
    });
  };

  //this function creates a new map based on filtering by whatever user enters in filter field
  //it is invoked within $scope.filterMap, see the above controller
  var filterDB = function(toFilterBy) {

    //gets everything from the db in an obj referenced as data
    return $http.get('/api/items')
      .then(function(data) {
        console.log(data);
        //filter our returned db by the desired itemName
        var filtered = data.data.filter(function(item) {
          return item.itemName.indexOf(toFilterBy) > -1;
        });

        //re-initialize map with only these markers
        Map.initMap(filtered);
      }, function(err) {
        console.log('Error when filterDB invoked - get from "/api/items" failed. Error: ', err);
      });
  };

  var removeFromDB = function(toRemove) {
    return $http.post('/pickup', toRemove)
      .then(function(data) {
        loadAllItems();
      }, function(err) {
        console.log('Error when removeFromDB invoked - post to "/pickup" failed. Error: ', err);
      });
  };

  //the DBActions factory returns the below object with methods of the functions
  //defined above
  return {
    saveToDB: saveToDB,
    filterDB: filterDB,
    removeFromDB: removeFromDB
  };
});
