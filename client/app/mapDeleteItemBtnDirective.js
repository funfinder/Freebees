
angular.module('map.delete', [])

.directive('deletebtn',function(){
  return {
    restrict : 'e',
    template: '<div>omg</div>',
    //contoller: 'DeleteButtonController'
  };
})

.controller('DelBtnController',function($scope,DBActions){
  $scope.item = {};
  console.log('yup')

  $scope.deleteItem = function(item){

    DBActions.removeFromDB(item);
  }

  $scope.checkScope = function(){
    console.log($scope.item);

  }
})

