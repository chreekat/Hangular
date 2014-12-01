/*global angular, divMod */
/*properties
    cells, covered, factory, floor, height, hideMouse, module,
    musen, neighborsMap, numMice, numNeighbors, position, prototype, push,
    random, rows, width
*/
/*jslint continue: true, plusplus: true, vars: true, white: true */

(function () {

"use strict";
var gb = angular.module("fladdermus.gameBoard", []);
gb.factory("GameBoard", function () {

    var Cell = function (props) {
        this.covered = props.covered;
        this.numNeighbors = props.numNeighbors;
        this.musen = props.musen;
        this.position = props.position;
    };

    var GameBoard = (function () {
        // private, closure methods
        var genEmptyRows = function (h, w) {
            var emptyRows = [];
            var i, j, row;
            for (i = 0; i < h; i++) {
                row = [];
                for (j = 0; j < w; j++) {
                    row.push(new Cell({
                        covered: true,
                        numNeighbors: 0,
                        musen: false,
                        position: [i,j]
                    }));
                }
                emptyRows.push({cells: row});
            }
            return emptyRows;
        };
        var addMice = function (numMice) {
            var numAdded = 0, maxLoc = this.height * this.width, loc;
            while (numAdded < numMice) {
                loc = divMod(Math.floor(Math.random() * maxLoc), this.width);
                if (! this.rows[loc[0]].cells[loc[1]].musen) {
                    set.call(this, loc);
                    numAdded++;
                }
            }
        };
        var set = function (loc) {
            var x = loc[0], y = loc[1];
            this.rows[x].cells[y].musen = true;
            this.neighborsMap([x, y], function (c) {
                c.numNeighbors++;
            });
        };
        var unset = function (loc) {
            var x = loc[0], y = loc[1];
            this.rows[x].cells[y].musen = false;
            this.neighborsMap([x, y], function (c) {
                c.numNeighbors--;
            });
        };

        // Constructor function
        var GameBoardCtor = function (h, w, numMice) {
            this.height = h;
            this.width = w;
            this.numMice = numMice;
            this.rows = genEmptyRows(h, w);
            addMice.call(this, numMice);
        };

        // Public member methods
        GameBoardCtor.prototype.hideMouse = function (cell) {
            var loc = cell.position;
            unset.call(this, loc);
            var i, j, tempCell;
            for (i = 0; i < this.height; i++) {
                for (j = 0; j < this.width; j++) {
                    // Goat's blood on the mantle
                    if (i === loc[0] && j === loc[1]) {
                        continue;
                    }
                    tempCell = this.rows[i].cells[j];
                    if (!tempCell.musen) {
                        set.call(this, [i,j]);
                        return;
                    }
                }
            }
        };
        GameBoardCtor.prototype.neighborsMap = function (targetPos, f) {
            var x = targetPos[0], y = targetPos[1];
            var results = [];
            // left-right and up-down
            var lr, ud;
            for (lr = -1; lr < 2; lr++) {
                for (ud = -1; ud < 2; ud++) {
                    if ((lr !== 0 || ud !== 0)  // don't process target position
                            && (ud + x >= 0 && ud + x < this.height)
                            && (lr + y >= 0 && lr + y < this.width))
                    {
                        results.push(f(this.rows[ud + x].cells[lr + y]));
                    }
                }
            }
            return results;
        };
        GameBoardCtor.prototype.uncoverCascade = function (targetCell) {
            var numUncovered = 0, uncoveredCts;
            var that = this;
            if (targetCell.covered) {
                targetCell.covered = false;
                numUncovered = 1;
                if (targetCell.numNeighbors === 0) {
                    uncoveredCts = this.neighborsMap(targetCell.position,
                            function (c) { return that.uncoverCascade(c) });
                    numUncovered += uncoveredCts.reduce(function(a,b) { return a + b }, 0);
                }
            }
            return numUncovered;
        };

        return GameBoardCtor;
    }());

  // public to the GameBoard service:
    return function (size) {
        var gameBoard;
        switch (size) {
            case "small":
                gameBoard = new GameBoard(9, 9, 10);
                break;
            case "medium":
                gameBoard = new GameBoard(16, 16, 40);
                break;
            case "large":
                gameBoard = new GameBoard(16, 30, 99);
                break;
            default:
                throw("Unknown board size: " + size);
        }
        return gameBoard;
    };
});

}());
