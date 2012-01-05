var numRows = 7;
var numCols = 7;
var blockWidth = 70;
var blockHeight = 70;
var width = blockWidth * numCols;
var height = blockHeight * numRows;
var lineLength = 4;

Piece = {Empty : 0, PlayerOne : 1, PlayerTwo : 2};

var turn;
var gameOver;
var movingRow = 0;
var movingCol = 0;

function initializeGame() {
    turn = Piece.PlayerOne;
    gameOver = false;
}

function initializeBoard() {
    var board = [];

    for(var i = 0; i < numRows; i++) {
        board[i] = [];
        for(var j = 0; j < numCols; j++) {
            board[i][j] = Piece.Empty;
        }
    }

    return board;
}

function fillCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
}

function renderBoard(ctx, board) {
    ctx.strokeStyle = "black";
    for(var i = 0; i < numRows; i++) {
        for(var j = 0; j < numCols; j++) {
            ctx.save();
            ctx.strokeStyle = "blue";
            ctx.strokeRect(j * blockWidth, i * blockHeight,
                           blockWidth, blockHeight);
            ctx.restore();
            if(board[i][j] == Piece.PlayerOne) {
                ctx.fillStyle = "red";
                fillCircle(ctx, j * blockWidth + blockWidth / 2,
                           i * blockHeight + blockHeight / 2,
                           blockWidth / 2 * 0.9);
            } else if(board[i][j] == Piece.PlayerTwo) {
                ctx.fillStyle = "yellow";
                fillCircle(ctx, j * blockWidth + blockWidth / 2,
                           i * blockHeight + blockHeight / 2,
                           blockWidth / 2 * 0.9);
            }
        }
    }
}

function mouseMove(e) {
    var x = 0;

    if(e.offsetX) {
        x = e.offsetX;
    } else if(e.layerX) {
        x = e.layerX;
    }

    movingCol = Math.floor(x / blockWidth);
}

function drawMovingPiece(ctx) {
    ctx.strokeStyle = "black";
    if(turn == Piece.PlayerOne) {
        ctx.fillStyle = "red";
    } else if(turn == Piece.PlayerTwo) {
        ctx.fillStyle = "yellow";
    }
    fillCircle(ctx, movingCol * blockWidth + blockWidth / 2,
               movingRow * blockHeight + blockHeight / 2,
               blockWidth / 2 * 0.9);
}

function clearBoard(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
}

function dropPiece(board) {
    var lastRow = numRows - 1;
    while(board[lastRow][movingCol] != Piece.Empty) {
        lastRow--;
    }

    if(lastRow == 0) {
        return;
    }

    board[lastRow][movingCol] = turn;

    if(turn == Piece.PlayerOne) {
        turn = Piece.PlayerTwo;
    } else if(turn == Piece.PlayerTwo) {
        turn = Piece.PlayerOne;
    }
}

function isGameHorizontalOver(board) {
    for(var i = 0; i < numRows; i++) {
        for(var j = 0; j <= numCols - lineLength; j++) {
            var start = board[i][j];
            var k;
            for(k = j + 1; k < j + lineLength; k++) {
                if(board[i][j] == Piece.Empty || board[i][k] != start) {
                    break;
                }
            }

            if(k == j + lineLength) {
                return true;
            }
        }
    }

    return false;
}

function isGameVerticalOver(board) {
    for(var i = 0; i < numCols; i++) {
        for(var j = 1; j <= numRows - lineLength; j++) {
            var start = board[j][i];
            var k;
            for(k = j + 1; k < j + lineLength; k++) {
                if(board[k][i] == Piece.Empty || board[k][i] != start) {
                    break;
                }
            }

            if(k == j + lineLength) {
                return true;
            }
        }
    }

    return false;
}

function isGameDiagonalLeftOver(board) {
    for(var i = lineLength - 1; i < numCols; i++) {
        for(var j = 1; j <= numRows - lineLength; j++) {
            var start = board[j][i];
            var k;
            var m;
            for(k = j + 1, m = i - 1; k < j + lineLength; k++, m--) {
                if(board[k][m] == Piece.Empty || board[k][m] != start) {
                    break;
                }
            }

            if(k == j + lineLength && m == i - lineLength) {
                return true;
            }
        }
    }

    return false;
}

function isGameDiagonalRightOver(board) {
    for(var i = numCols - lineLength; i >= 0; i--) {
        for(var j = 1; j <= numRows - lineLength; j++) {
            var start = board[j][i];
            var k;
            var m;
            for(k = j + 1, m = i + 1; k < j + lineLength; k++, m++) {
                if(board[k][m] == Piece.Empty || board[k][m] != start) {
                    break;
                }
            }

            if(k == j + lineLength && m == i + lineLength) {
                return true;
            }
        }
    }

    return false;
}

function isGameDiagonalOver(board) {
    return isGameDiagonalLeftOver(board) || isGameDiagonalRightOver(board);
}

function isGameOver(board) {
    return isGameHorizontalOver(board) ||
           isGameVerticalOver(board) ||
           isGameDiagonalOver(board);
}

function boardFull(board) {
    for(var i = 1; i < numRows; i++) {
        for(var j = 0; j < numCols; j++) {
            if(board[i][j] == Piece.Empty) {
                return false;
            }
        }
    }

    return true;
}

function handleGameOver(ctx, board) {
    var gameOverText = "% wins";

    ctx.save();
    ctx.fillStyle = "green";
    ctx.font = "50px sans-serif";

    if(isGameOver(board) && !gameOver) {
        if(turn == Piece.PlayerOne) {
            gameOverText = gameOverText.replace("%", "Yellow");
        } else if(turn == Piece.PlayerTwo) {
            gameOverText = gameOverText.replace("%", "Red");
        }

        ctx.fillText(gameOverText, width / 2 - 100, height / 2);
        gameOver = true;
    } else if(boardFull(board) && !gameOver) {
        ctx.fillText("Game Tied", width / 2 - 100, height / 2);
        gameOver = true;
    }

    ctx.restore();
}

function draw() {
    var canvas;
    var ctx;
    var board;

    initializeGame();
    board = initializeBoard();

    canvas = document.getElementById("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    canvas.onmousemove = mouseMove;
    canvas.onmouseup = function(e) {
                           dropPiece(board);
                       };

    ctx = canvas.getContext("2d");

    setInterval(function() {
        if(!gameOver) {
            clearBoard(ctx);
            renderBoard(ctx, board);
            handleGameOver(ctx, board);
            drawMovingPiece(ctx);
        }
    }, 33);
}
