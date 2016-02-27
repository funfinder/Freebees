var app = angular.module('myApp', ['map.services', 'ui.router','flow','GoogleMapsInitializer'])
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
          templateUrl: "main/itemForm.html",
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
          templateUrl: "main/itemForm.html",
          controller: "InputController"
        }
      }
    })
  })

.controller('MapController', function($scope,Map,Initializer,DBActions) {
  Initializer.mapsInitialized
  .then(function() {
     Map.map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 37.764115, lng: -122.435280},
     zoom: 12
   });
     Map.infoWindow = new google.maps.InfoWindow();
    DBActions.loadAllItems();
  });
})

.controller('InputController', function($scope,Map,Initializer,DBActions,$state){

$scope.autocomplete = {};
Initializer.mapsInitialized
  .then(function() {
      var input = document.getElementById('inputAddress');
      var options = {};
      $scope.autocomplete = new google.maps.places.Autocomplete(input, options);
      google.maps.event.addListener($scope.autocomplete, 'place_changed', function() {
        console.log('place changed',$scope.autocomplete.getPlace());
      });
    });

  $scope.sendPost = function(image) {
    //convert inputted item name to lowerCase
    var lowerCaseItem = $scope.user.item;
    //convert inputted address, need to get value with JS bc angular can't detect autocomplete
        //after address converted, save user input item and location to db
    var place =  $scope.autocomplete.getPlace();

    var LatLng = {lat:place.geometry.location.lat() , lng:place.geometry.location.lng() };
    var query = { item: lowerCaseItem, LatLng: LatLng, createdAt: new Date()};
    if($scope.uploader.flow.files.length>0){
      var reader = new window.FileReader();
      //console.log();
      reader.readAsDataURL($scope.uploader.flow.files[0].file);
       reader.onloadend = function() {
        query.image = reader.result
      DBActions.saveToDB(query,successCallback);
     };
    }
    else
    {
      DBActions.saveToDB(query,successCallback);
    }

    var successCallback = function(){
      if ($scope.uploader.flow.files.length >0)
      {
        $scope.uploader.flow.files.shift();
      }
      $scope.clearForm();
      $state.go('map')
    }
  };
})

//dependencies injected include DBActions factory and Map factory
.controller('FormController', function($scope, $http, DBActions, Map,$state) {
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



  //this function filters map based on what user enters into filter field
  $scope.filterMap = function() {

    //convert inputted filter item to lowerCase so that matches with lowerCase values stored in db
    var lowerCaseFilterItem = convertToLowerCase($scope.search.input);
    var searchInput = lowerCaseFilterItem;
    $state.go('map');
    DBActions.filterDB(searchInput,function(data){
      console.log('did i get here?')
        $scope.search.input = '';
        $scope.clearForm();

    });
  };

  //removes a posting from the db and from the map
  $scope.removePost = function() {
    //convert inputted item name to lowerCase to match what's already in db
    var lowerCaseDeleteItem = convertToLowerCase($scope.user.item);
    //convert inputted address
    var inputtedAddress = document.getElementById('inputAddress').value;
    // Map.geocodeAddress(geocoder, Map.map, inputtedAddress, function(converted) {
    //   DBActions.removeFromDB({ item: lowerCaseDeleteItem, LatLng: converted });
    // });
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
  var saveToDB = function(toSave,callback) {
    return $http.post('/submit', toSave)
    //after item has been saved to db, returned data has a data property
    //so we need to access data.data, see below
    .then(function(data) {
      stopSpinner();
      //data.data has itemName prop, itemLocation prop, and _id prop, which are all expected since this is how
      //our mongoDB is formatted. Anything returned from db should have these props
      //Map.addMarker(map, data.data, infoWindow);
      //the 'map' argument here is referencing the global map declared in app.js
      //this could be manipulated in chrome console by user. Future refactor could be to store
      //map within Map factory instead of global space.
      callback();
    }, function(err) {
      console.log('Error when saveToDB invoked - post to "/" failed. Error: ', err);
    });
  };

  //this function creates a new map based on filtering by whatever user enters in filter field
  //it is invoked within $scope.filterMap, see the above controller
  var filterDB = function(toFilterBy,callback) {

    //gets everything from the db in an obj referenced as data
    return $http.get('/api/items')
      .then(function(data) {
        callback(data);
        //filter our returned db by the desired itemName
        var filtered = data.data.filter(function(item) {
          return item.itemName.indexOf(toFilterBy) > -1;
        });
        Map.removeMaker();
        //re-initialize map with only these markers
         for (var i = 0; i < filtered.length; i++){
          Map.addMarker(filtered[i],i*30);
        }
      }, function(err) {
        console.log('Error when filterDB invoked - get from "/api/items" failed. Error: ', err);
      });
  };

  var removeFromDB = function(toRemove) {
    return $http.post('/pickup', toRemove)
      .then(function(data) {
        Map.loadAllItems();
      }, function(err) {
        console.log('Error when removeFromDB invoked - post to "/pickup" failed. Error: ', err);
      });
  };

  var loadAllItems = function(){
  $http.get('/api/items').then(function(result){
    //loop through data returned from db to place on map
     for (var i = 0; i < result.data.length; i++){

      Map.addMarker(result.data[i],i*30);
    }
    },function(jqXHR, exception){
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
