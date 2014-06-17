fladdermus = angular.module("fladdermus", []);

fladdermus.directive("smileyFace", function() {
  return {
    restrict: "E",
    templateUrl: "smiley.html",
    scope: {
      pressed: "@"
    },
  };
});

fladdermus.directive("timer", function($interval) {
  return {
    restrict: "E",
    template: "<span>{{m.time}}</span>",
    scope: true,
    link: function(scope) {
      // This started out being a great example of a problem. I left off
      // 'scope', so I just had m = { ...} and in the $interval, 'm.time =
      // ...'. This conflicted with the template, which referred to m.time.
      scope.m = {time : 0}
      p = $interval(function () { scope.m.time = scope.m.time + 1 }, 1000, 999);

      scope.$on('$destroy', function () { $interval.cancel(p) });
      scope.$on('timer-reset', function () {scope.m.time = 0});
    },
  };
});

fladdermus.directive('boardCell', function() {
  return {
    restrict: 'E',
    templateUrl: 'boardCell.html',
  };
});

fladdermus.controller('gameCtrlr', function($scope) {
  $scope.m = {
    rows: genGameBoard(),
  };
  $scope.resetGame = function () {
    $scope.m.rows = genGameBoard();
    $scope.$broadcast('timer-reset');
  };
});

genGameBoard = function () {
  return [{
      cells: [{
        covered: true,
        numNeighbors: 6,
        musen: false,
      }],
  }];
};
