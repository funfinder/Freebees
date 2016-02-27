
angular.module('map.delete', [])

.directive('btn-delete',function(){

  return {
    template: '/main/infoWindow.html'
  };
})

.controller('DeleteButtonController',function($scope,DBActions){
  $scope.item = {};

  $scope.deleteItem = function(item){

    DBActions.removeFromDB(item);
  }

  $scope.checkScope = function(){
    console.log($scope.item);

  }
})
