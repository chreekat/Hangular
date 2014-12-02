"use strict";
var fladdermus = angular.module("fladdermus", ['webStorageModule', 'fladdermus.gameBoard']);
// http://codepen.io/WinterJoey/pen/sfFaK
fladdermus.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g,
            function(txt) {
                return txt.charAt(0).toUpperCase()
                    + txt.substr(1).toLowerCase();}) : '';
    };
});
fladdermus.filter('pad', function () {
    return function(input, size) {
        var s = "" + Math.pow(10, size+1) + input;
        return s.slice(-size);
    };
});
fladdermus.directive('preventContextMenu', function () {
    return function(scope, element, attrs) {
        element.bind('contextmenu', function (event) {
            event.preventDefault();
        });
    };
});
fladdermus.directive("smileyFace", function() {
    return {
        restrict: "E",
        templateUrl: "smiley.html",
        scope: {
            ruhroh: "=",
            gameStatus: "@"
        },
        controller: function ($scope) {
            $scope.imgSrc = function () {
                var src = "";
                if ($scope.gameStatus === "playing") {
                    if ($scope.ruhroh) {
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
        template: "<span>{{m.time | pad:3}}</span>",
        link: function(scope) {
            var startTimer, p;
            startTimer = function () {
                p = $interval(
                    function () { scope.m.time = scope.m.time + 1 }, 1000, 999
                );
            }
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

fladdermus.directive('boardCell', function(GameBoard) {
    return {
        restrict: 'EA',
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
            var uncover = function (cell) {
                if ($scope.m.gameStatus !== "playing"
                        || cell.flag === "flag"
                        || cell.covered == false) {
                    return;
                }
                if (cell.musen && $scope.m.uncoveredCells > 0) {
                    $scope.gameOver(false);
                } else {
                    if (cell.musen) {
                        $scope.m.gameBoard.hideMouse(cell);
                    }
                    var uncovered = $scope.m.gameBoard.uncoverCascade(cell);
                    $scope.m.uncoveredCells += uncovered;
                    if ($scope.m.gameBoard.width * $scope.m.gameBoard.height ==
                            $scope.m.uncoveredCells + $scope.m.gameBoard.numMice) {
                        $scope.gameOver(true);
                    }
                }
            };
            var uncoverNeighbors = function (cell) {
                if (cell.covered == false) {
                    var flaggedCt = ($scope.m.gameBoard.neighborsMap(cell.position,
                        function (c) {
                            if (c.flag === "flag") {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                    )).reduce(function (a,b) { return a + b; }, 0);
                    if (flaggedCt === cell.numNeighbors) {
                        $scope.m.gameBoard.neighborsMap(cell.position, function (c) {
                            uncover(c);
                        });
                    }
                }
            };
            $scope.cellAction = function (event) {
                if (event.button === 0 && $scope.m.mouseAction === "uncover") {
                    $scope.m.mouseAction = "none";
                    if (event.ctrlKey) {
                        uncoverNeighbors($scope.cell);
                    } else {
                        uncover($scope.cell);
                    }
                } else if (event.button === 2 && $scope.m.mouseAction === "flag") {
                    $scope.m.mouseAction = "none";
                    $scope.toggleflag();
                } else if (event.button === 0 && $scope.m.mouseAction === "uncoverNeighbors") {
                    uncoverNeighbors($scope.cell);
                } else if (event.button === 2 && $scope.m.mouseAction !== "flag") {
                    $scope.m.mouseAction = "none";
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

fladdermus.directive('hiScores', function() {
    var Records = function () {
        this.small = [];
        this.medium = [];
        this.large = [];
    };
    var migrateOldScores = function (webStorage) {
        var oldScores = webStorage.get('hiScores');
        webStorage.remove('hiScores');
        oldScores.map(function(rec) {
            delete rec.$$hashKey;
        });
        var rec = new Records();
        rec.small = oldScores;
        return rec;
    };
    return {
        restrict: "E",
        templateUrl: "hiScores.html",
        controller: function($scope, $element, webStorage, $timeout) {
            // version 2 : object keyed on size
            var key = 'hiScores2';
            $scope.saveInProgress = false;
            $scope.records = webStorage.get(key);
            if ($scope.records === null) {
                if (webStorage.has('hiScores')) {
                    // Backward compatibility
                    $scope.records = migrateOldScores(webStorage);
                } else {
                    $scope.records = new Records() ;
                }
                webStorage.add(key, $scope.records);
            } else {
                // Remove hashKeys from previous run
                Object.getOwnPropertyNames($scope.records).map(function (boardSize) {
                    $scope.records[boardSize].map(function (rec) {
                        delete rec.$$hashKey;
                    })
                });
            }
            $scope.$watch('records', function (newRec, oldRec) {
                if (newRec !== null && newRec !== oldRec) {
                    webStorage.add(key, newRec);
                }
            }, true);
            $scope.$on('game-over', function () {
                if ($scope.m.gameStatus === "won") {
                    $scope.saveInProgress = true;
                    // Set a timeout because the element isn't visible yet.
                    // Waiting on a digest loop.
                    $timeout(
                        function () {
                            var el = $element.find("input")[0];
                            el.focus();
                            el.select();
                        },
                        100);
                }
            });
            $scope.save = function () {
                $scope.saveInProgress = false;
                $scope.records[$scope.m.gameSize].push({name: $scope.name, score: $scope.m.time});
            };
        },
    };
});

fladdermus.controller('gameCtrlr', function($scope, webStorage, GameBoard) {
    $scope.m = {
        gameBoard: null,
        gameStatus: "playing",
        gameSize: webStorage.get("gameSize") || "small",
        uncoveredCells: 0,
        flagged: 0,
        time: 0,
        mouseAction: "none",
    };
    $scope.m.gameBoard = GameBoard($scope.m.gameSize);
    $scope.resetGame = function () {
        $scope.m.gameStatus = "playing";
        $scope.m.gameBoard = GameBoard($scope.m.gameSize);
        $scope.m.flagged = 0;
        $scope.m.uncoveredCells = 0;
        $scope.$broadcast('timer-reset');
    };
    $scope.gameOver = function(won) {
        if (won) {
            $scope.m.gameStatus = "won";
            $scope.m.flagged = $scope.m.gameBoard.numMice;
        } else {
            $scope.m.gameStatus = "lost";
        }
        $scope.$broadcast('game-over');
    };
    $scope.$watch('m.gameSize', function (newSize, oldSize) {
        if ((newSize === oldSize)
                || ($scope.m.gameStatus === "playing"
                    && $scope.m.uncoveredCells > 0)
                    && ! confirm("Start a new game with a new size?")) {
            return;
        }
        webStorage.add("gameSize", newSize);
        $scope.resetGame();
    });
});
