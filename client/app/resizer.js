app.directive('flowImageResize', function($q) {
  return {
    'require': 'flowInit',
    'link': function(scope, element, attrs) {
      scope.$flow.opts.preprocess = function(chunk) {
        chunk.fileObj.promise.then(function() {
          if (!chunk.fileObj.resized) {
            chunk.fileObj.resized = true;
            chunk.fileObj.retry();
          }
        });
        if (chunk.fileObj.resized) {
          chunk.preprocessFinished();
        }
      };
      scope.$flow.on('filesSubmitted', function(files) {
        angular.forEach(files, function(file) {
          var nativeFile = file.file; // instance of File, same as here: https://github.com/flowjs/ng-flow/blob/master/src/directives/img.js#L13
          file.file = null; // do not display it
          var deferred = $q.defer();
          file.promise = deferred.promise;

          loadImage(
            nativeFile,
            function(canvas) {
              canvas.toBlob(function(blob) {
                file.file = blob;
                file.size = blob.size;
                deferred.resolve();
                scope.$digest();
              });
            }, {
              canvas: true,
              crop: true,
              //maxWidth: 300,
              maxHeight: 300
            }
          );
        });
      })
    }
  };
});
app.directive('myFlowImg', [function() {
  return {
    'scope': false,
    'require': '^flowInit',
    'link': function(scope, element, attrs) {
      var file = attrs.myFlowImg;
      scope.$watch(file + '.file', function(file) {
        if (!file) {
          return;
        }
        var fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function(event) {
          scope.$apply(function() {
            attrs.$set('src', event.target.result);
          });
        };
      });
    }
  };
}]);
