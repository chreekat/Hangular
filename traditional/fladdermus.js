fladdermus = angular.module("fladdermus", []);

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
				src = "";
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
				$scope.cell.covered = false;
				if ($scope.cell.musen) {
					$scope.m.gameStatus = "lost";
				} else {
					$scope.m.uncoveredCells++;
					if ($scope.width * $scope.height ==
					        $scope.uncoveredCells + $scope.numMice) {
						$scope.m.gameStatus = "won";
					}
				}
			};
            $scope.imgSrc = function () {
				src = "";
				c = $scope.cell;
				stat = $scope.m.gameStatus;
				if (stat === "playing") {
					if (c.covered) {
						src = "covered_" + c.flag;
					} else {
						if (! c.musen) {
							src = c.numNeighbors;
						} else {
							src = "sadbat";
						}
					}
				} else if (c.musen) { // game over
					if (stat === "lost") {
						src = "sadbat";
					} else {
						src = "happybat";
					}
				} else {
					src = c.numNeighbors;
				}
				return "img/" + src + ".png";
			};
		},
	};
});

fladdermus.controller('gameCtrlr', function($scope) {
	$scope.m = {
		rows: [],
		gameStatus: "playing",
		uncoveredCells: 0,
		width: 9,
		height: 9,
		numMice: 10,
		flagged: 0,
	};
	$scope.m.rows = genGameBoard($scope.m.width, $scope.m.height, $scope.m.numMice);
	$scope.resetGame = function () {
		$scope.m.gameStatus = "playing";
		$scope.m.rows = genGameBoard($scope.m.width, $scope.m.height, $scope.m.numMice);
		$scope.m.flagged = 0;
		$scope.$broadcast('timer-reset');
	};
});

div = function(a, b) {
	return Math.floor(a/b);
}

genGameBoard = function (h, w, numMus) {
	if (numMus > h*w) {
		throw("Impossible game board: more mus than tiles!");
	}
	cells = [];
	maxLoc = h * w;
	for (i = 0; i < maxLoc; i++) {
		cells[i] = {
			covered: true,
			numNeighbors: 0,
			musen: false,
		};
	}

	set = function (loc) {
		cells[loc].musen = true;
		// left-right and up-down
		for (lr = -1; lr < 2; lr++) {
			for (ud = -1; ud < 2; ud++) {
				neighbor = loc + w*ud + lr;
				if ((lr != 0 || ud != 0)  // don't process ourself
						&& (div(loc, w) == div(loc+lr, w)) // don't wrap around
						&& ((neighbor >= 0 && neighbor < maxLoc)))    // don't fall off board
				{
					cells[neighbor].numNeighbors++;
				}
			}
		}
	};

	// I'm told this is the original logic
	for(i = 0; i < numMus; i++) {
		loc = Math.floor(Math.random() * maxLoc);
		if (! cells[loc].musen) {
			set(loc);
		}
		else {
			for (j = 0; j < maxLoc; j++) {
				if (! cells[j].musen) {
					set(j);
					break;
				}
			}
		}
	}

	rows = [];
	for (i = 0; i < h; i++) {
		rows[i] = { cells: cells.slice(i*w, i*w+w) };
	}
	return rows;
};
