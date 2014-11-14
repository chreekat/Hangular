fladdermus = angular.module("fladdermus", []);

fladdermus.directive('leftmouseup', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.leftmouseup);
        element.bind('mouseup', function(event) {
            if (event.button === 0) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            }
        });
    };
});
fladdermus.directive('rightclick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.rightclick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});


fladdermus.directive("smileyFace", function() {
    return {
        restrict: "E",
        templateUrl: "smiley.html",
        scope: {
            pressed: "@",
            gameStatus: "@"
        },
        controller: function ($scope) {
            $scope.imgSrc = function () {
                var src = "";
                if ($scope.gameStatus === "playing") {
                    if ($scope.pressed === "true") {
                        src = "uhohface";
                    } else {
                        src = "happyface";
                    }
                } else if ($scope.gameStatus === "lost") {
                    src = "sadface";
                } else {
                    src = "happyface";
                }
                return "img/" + src + ".png";
            }
        }
    };
});

fladdermus.directive("timer", function($interval) {
    return {
        restrict: "E",
        template: "<span>{{m.time}}</span>",
        scope: true,
        link: function(scope) {
            var startTimer, p;
            startTimer = function () {
                p = $interval(
                    function () { scope.m.time = scope.m.time + 1 }, 1000, 999
                );
            }
            // This started out being a great example of a problem. I left off
            // 'scope', so I just had m = { ...} and in the $interval, 'm.time =
            // ...'. This conflicted with the template, which referred to m.time.
            scope.m = {time : 0}
            startTimer();

            scope.$on('$destroy', function () { $interval.cancel(p) });
            scope.$on('timer-reset', function () {
                $interval.cancel(p);
                scope.m.time = 0;
                startTimer();
            });
            scope.$on('game-over', function () {
                $interval.cancel(p);
            });
        },
    };
});

fladdermus.directive('boardCell', function() {
    return {
        restrict: 'E',
        templateUrl: 'boardCell.html',
        controller: function ($scope) {
            $scope.cell.flag = 'none';
            $scope.toggleflag = function () {
                if ($scope.m.gameStatus !== "playing"
                        || ! $scope.cell.covered) {
                    return;
                }
                var flags = ['none', 'flag', 'question'];
                var i = flags.indexOf($scope.cell.flag);
                $scope.cell.flag = flags[(i+1) % 3];
                if (i === 0) {
                    $scope.m.flagged++;
                } else if (i === 1) {
                    $scope.m.flagged--;
                }
            };
            $scope.uncover = function () {
                if ($scope.m.gameStatus !== "playing"
                        || $scope.cell.flag === "flag") {
                    return;
                }
                if ($scope.cell.musen) {
                    $scope.gameOver(false);
                } else {
                    uncovered = uncoverCascade({
                        target: $scope.cell,
                        gameBoard: $scope.m.gameBoard,
                    });
                    $scope.m.uncoveredCells += uncovered;
                    if ($scope.m.width * $scope.m.height ==
                            $scope.m.uncoveredCells + $scope.m.numMice) {
                        $scope.gameOver(true);
                    }
                }
            };
            // Hardest part of this entire game. I'd draw a chart, but
            // maybe I'll just take a picture of my notebook and throw it
            // in the repo instead. Let me just get my camera....
            $scope.imgSrc = function () {
                var src = "";
                var c = $scope.cell;
                var cover = "covered_" + c.flag;
                var stat = $scope.m.gameStatus;
                // The one case that has the easiest test.
                src = c.numNeighbors;
                // All other cases fall under this blanket:
                if (c.covered || c.musen) {
                    // c.musen is the next big divisor.
                    if (c.musen) {
                        switch (stat) {
                            case "playing":
                                src = cover;
                                break;
                            case "lost":
                                if (c.flag === "flag") {
                                    src = cover;
                                } else {
                                    src = "sadbat";
                                }
                                break;
                            case "won":
                                src = "happybat";
                                break;
                        }
                    } else { // all that's left: (c.covered && ! c.musen)
                        switch (stat) {
                            case "playing":
                                src = cover;
                                break;
                            case "lost":
                                if (c.flag === "flag")  {
                                    src = "badFlag";
                                } else {
                                    src = cover;
                                }
                                break;
                            case "won":
                                src = c.numNeighbors;
                                break;
                        }
                    }
                }
                return "img/" + src + ".png";
            };
        },
    };
});

fladdermus.controller('gameCtrlr', function($scope) {
    $scope.m = {
        gameBoard: null,
        gameStatus: "playing",
        uncoveredCells: 0,
        width: 9,
        height: 9,
        numMice: 10,
        flagged: 0,
    };
    $scope.m.gameBoard = GameBoard.genGameBoard($scope.m.width, $scope.m.height, $scope.m.numMice);
    $scope.resetGame = function () {
        $scope.m.gameStatus = "playing";
        $scope.m.gameBoard = GameBoard.genGameBoard($scope.m.width, $scope.m.height, $scope.m.numMice);
        $scope.m.flagged = 0;
        $scope.m.uncoveredCells = 0;
        $scope.$broadcast('timer-reset');
    };
    $scope.gameOver = function(won) {
        $scope.$broadcast('game-over');
        if (won) {
            $scope.m.gameStatus = "won";
            $scope.m.flagged = $scope.m.numMice;
        } else {
            $scope.m.gameStatus = "lost";
        }
    };
});
