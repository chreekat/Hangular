// The logic of fladdermus.
//
// For completeness, I will include actions that are already
// half-implemented. One of the games being played here is answering the
// question of whether actions/updates can compose between parent/child
// directives.
//
// If a covered square is clicked, it is uncovered.
//   - cells handle this
// If a mus is uncovered, the game is lost.
//   - cells uncover themselves, so if they have musen they must emit
//     'mus-angry'
// If the last empty square is uncovered, the game is won.
//   - cells uncover themselves. Track game state's number of uncovered
//     cells remaining, and emit 'mus-happy' at the proper time.
// If an uncovered square is control-clicked, do the uncoverCascade.
// If a covered square is right-clicked, toggle between
//    flagged/question/unflagged. This is cell-independent as well.
// If smileyFace is clicked, reset the board game and the timer.
// While mouse is down, smileyFace is uh-oh face
//
// The uncoverCascade is its own rather complex set of steps. The uncover
// cascade needs to stop if a mus is uncovered. So, it has to run FIFO.
//
// Same goes for creating a new board game.
