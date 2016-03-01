describe("this testing suite", function() {
  it ("should show that true is true", function() {
    expect(true).toEqual(true);
  })
  it ("should show that false is not true", function() {
    expect(false).not.toBe(true);
  })
});

describe("format date function", function() {
  it ("should be a function", function() {
    expect(typeof formatDate).toEqual('function');
  })
  // it ("should returned formatted date", function() {
  //   expect(formatDate()).toContain("/");
  // })
});

// describe("Google Maps Initializer", function() {
//   it ("should be able to pull functions from this GoogleMapsInitializer.js", function() {
//     expect(typeof blue).toEqual('function');
//   });
//   it ("should be able to pull functions from within Initializer factory", function() {
//     expect(typeof purple).toEqual('function');
//   })
// });

// describe("delete button", function() {
//   it ("should exist", function() {
//     expect(typeof deleteItem).toEqual('function');
//   })
//   it ("should remove clicked item from DB", function() {
        //add item to DB
//     //mock click on delete button of item
//     //expect item to not exist in DB
//   })
// })

describe("asyncLoad", function() {
//mock dependent services

      //add angular module that contains services

    //get references to objects
    beforeEach(inject(function($window, $q, Initializer){
      var mockWindow, mockQ, Initializer;
      module('GoogleMapsInitializer');

      mockWindow= $window; //injected
      mockQ= $q; //injected 
      Initializer = Initializer; //name of service
    }))

  //use $injector to indicate that you want to test factory
  it ("should let test function (purple) exist", function() {
    expect(typeof purple).toEqual('function');
  })

})





