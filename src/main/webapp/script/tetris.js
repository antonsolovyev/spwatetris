var TETRIS = {};

TETRIS.round = function(value)
{
    if(value > 0)
        return Math.floor(value);
    else
        return Math.ceil(value);
};

TETRIS.color = function(spec)
{
    var that = {};
    
    that.name = spec.name;
    
    that.toString = function()
    {
        return 'color: ' + that.name;
    };
    
    return that;
};

TETRIS.Color =
{
    CYAN : TETRIS.color({name : 'CYAN'}),
    BLUE : TETRIS.color({name : 'BLUE'}),
    ORANGE : TETRIS.color({name : 'ORANGE'}),
    YELLOW : TETRIS.color({name : 'YELLOW'}),
    GREEN : TETRIS.color({name : 'GREEN'}),
    PURPLE : TETRIS.color({name : 'PURPLE'}),
    RED : TETRIS.color({name : 'RED'})
};

TETRIS.cell = function(spec)
{
    var that = {};
    
    that.x = spec.x;
    that.y = spec.y;
    that.color = spec.color;
    
    that.toString = function()
    {
        return 'cell: x: ' + that.x + ' y: ' + that.y + ' color: ' + that.color;
    };
    
    return that;
};

TETRIS.direction = function(spec)
{
    var that = {};
    
    that.name = spec.name;
    that.value = spec.value;
    
    that.toString = function()
    {
        return 'direction: ' + that.name;
    };
    
    return that;
};

TETRIS.Direction =
{
    CLOCKWISE : TETRIS.direction({name : 'CLOCKWISE', value : 1}),
    COUNTERCLOCKWISE : TETRIS.direction({name : 'COUNTERCLOCKWISE', value : -1})
};

TETRIS.piece = function(spec)
{
    var that = {};
    
    that.centerX = spec.centerX;
    that.centerY = spec.centerY;
    that.cells = [];
    
    if(spec.cells)
    {
        that.cells = spec.cells.slice(0);
    }
    
    if(spec.cellCoordinates && spec.cellColor)
    {
        for(var i in spec.cellCoordinates)
            that.cells.push(TETRIS.cell({x : spec.cellCoordinates[i].x, y : spec.cellCoordinates[i].y, color : spec.cellColor}));
    }
    
    that.toString = function()
    {
        var res = 'piece: ';
    
        for(var i in that.cells)
            res += that.cells[i] + ', ';

        return res;
    };
    
    that.makeTranslated = function(x, y)
    {
        var res = TETRIS.piece({cells : [], centerX : 0, centerY : 0});
        
        for(var i in that.cells)
            res.cells.push(TETRIS.cell({x : that.cells[i].x + x, y : that.cells[i].y + y, color : that.cells[i].color}));
        
        res.centerX = that.centerX + x;
        res.centerY = that.centerY + y;
        
        return res;
    };

    that.makeRotated = function(direction)
    {
        var res = TETRIS.piece({cells : [], centerX : 0, centerY : 0});
        
        for(var i in that.cells)
            res.cells.push(TETRIS.cell({
                x : direction.value * (that.centerY - that.cells[i].y) + that.centerX,
                y : direction.value * (that.cells[i].x - that.centerX) + that.centerY,
                color : that.cells[i].color}));

        res.centerX = that.centerX;
        res.centerY = that.centerY;

        return res;
    };
    
    return that;
};

TETRIS.Piece = 
{
    PIECE_I : TETRIS.piece({cellCoordinates : [{x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}, {x : 3, y : 1}], cellColor : TETRIS.Color.CYAN, centerX : 1.5, centerY : 1.5}),
    PIECE_J : TETRIS.piece({cellCoordinates : [{x : 0, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}], cellColor : TETRIS.Color.BLUE, centerX : 1, centerY : 1}),
    PIECE_L : TETRIS.piece({cellCoordinates : [{x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}, {x : 2, y : 0}], cellColor : TETRIS.Color.ORANGE, centerX : 1, centerY : 1}),
    PIECE_O : TETRIS.piece({cellCoordinates : [{x : 1, y : 0}, {x : 2, y : 0}, {x : 1, y : 1}, {x : 2, y : 1}], cellColor : TETRIS.Color.YELLOW, centerX : 1.5, centerY : 0.5}),
    PIECE_S : TETRIS.piece({cellCoordinates : [{x : 1, y : 0}, {x : 2, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}], cellColor : TETRIS.Color.GREEN, centerX : 1.5, centerY : 0.5}),
    PIECE_T : TETRIS.piece({cellCoordinates : [{x : 1, y : 0}, {x : 0, y : 1}, {x : 1, y : 1}, {x : 2, y : 1}], cellColor : TETRIS.Color.PURPLE, centerX : 1, centerY : 1}),
    PIECE_Z : TETRIS.piece({cellCoordinates : [{x : 0, y : 0}, {x : 1, y : 0}, {x : 1, y : 1}, {x : 2, y : 1}], cellColor : TETRIS.Color.RED, centerX : 1, centerY : 1})
};

TETRIS.gameState = function(spec)
{
    var that = {};
    
    that.name = spec.name;
    
    that.toString = function()
    {
        return 'game state: ' + that.name;
    };
    
    return that;
};

TETRIS.GameState = 
{
    IDLE : TETRIS.gameState({name : 'IDLE'}),
    RUNNING : TETRIS.gameState({name : 'RUNNING'}),
    PAUSED : TETRIS.gameState({name : 'PAUSED'}),
    GAMEOVER : TETRIS.gameState({name : 'GAMEOVER'}),
    FREEFALL : TETRIS.gameState({name : 'FREEFALL'})
};

TETRIS.tetrisEngine = function(spec)
{
    var INITIAL_DELAY = 50;
    var FREEFALL_DELAY = 1;
    var LINE_COST = 30;
    var PIECE_COST = 10;
    var SCORE_PER_SPEED = 800;
    var ACCELERATION_FACTOR = 1.2;
    var TIMERTICK = 20;
    
    var that = {};
    
    that.width = spec.width;
    that.height = spec.height;
    // Internals
    var listeners = [];        
    var timer;
    // Sea, piece, next piece
    that.sea;
    that.piece;
    that.nextPiece;
    // Parameters
    that.lineCount;
    that.pieceCount;
    that.score;
    that.speed;        
    var delay;
    var moveTimer;
    that.gameState;
    
    var getRandomPiece = function()
    {
        var pieces = [];
        
        for(var i in TETRIS.Piece)
            pieces.push(TETRIS.Piece[i]);
        
        return pieces[TETRIS.round(Math.random() * pieces.length)];
    };

    var initParameters = function()
    {
        that.lineCount = 0;
        that.pieceCount = 0;
        that.score = 0;
        that.speed = 1;        
        delay = INITIAL_DELAY;
        moveTimer = 0;
        that.gameState = TETRIS.GameState.IDLE;
    };
    
    var initSea = function()
    {
        that.sea = [];
    };
    
    var initPieces = function()
    {
        that.piece = null;
        that.nextPiece = getRandomPiece();
    };
    
    var postUpdate = function()
    {
        for(var i in listeners)
            listeners[i].changeNotify(that);
    };

    var adjustScoreSpeedDelay = function()
    {
        that.score = TETRIS.round(that.lineCount * LINE_COST + that.pieceCount * PIECE_COST);
        that.speed = TETRIS.round(that.speed < 10 ? that.score / SCORE_PER_SPEED + 1 : 10);
        delay = TETRIS.round(INITIAL_DELAY / Math.exp(Math.log(ACCELERATION_FACTOR) * (that.speed - 1)));
        postUpdate();
    };

    var isCellInside = function(cell)
    {
        if(cell.x >= 0 && cell.x < that.width && cell.y >= 0 && cell.y < that.height)
                return(true);
        return(false);
    };

    var isSeaContainingXY = function(x, y)
    {
        for(var i in that.sea)
            if(that.sea[i].x === x && that.sea[i].y === y)
                return true;
        return false;
    };

    var isSeaContainingCell = function(cell)
    {
        return isSeaContainingXY(cell.x, cell.y);
    };

    var isSeaOverlapping = function(piece)
    {
        for(var i in piece.cells)
            if(isSeaContainingCell(piece.cells[i]))
                return true;
        return false;
    };

    var isPieceInside = function(piece)
    {
        for(var i in piece.cells)
            if(!isCellInside(piece.cells[i]))
                return false;
        return true;
    };

    var translatePiece = function(x, y)
    {
        if(!that.piece)
            return false;
                
        var newPiece = that.piece.makeTranslated(x, y);

        if(isSeaOverlapping(newPiece) || !isPieceInside(newPiece))
            return false;
        
        that.piece = newPiece;

        postUpdate();
        
        return true;
    };

    var rotatePiece = function(direction)
    {
        if(!that.piece)
            return false;

        var newPiece = that.piece.makeRotated(direction);

        if(isSeaOverlapping(newPiece) || !isPieceInside(newPiece))
            return false;
        
        that.piece = newPiece;

        postUpdate();
        
        return true;
    };

    var pumpoutSea = function()
    {
        var full_lines = 0;

        for(var i = 0; i < that.height; i++)
        {
            var full_line = true;
            for(var j = 0; j < that.width; j++)
            {
                if(!isSeaContainingXY(j, i))
                {
                    full_line = false;
                    break;
                }
            }
            if(full_line)
            {
                full_lines++;

                var newSea = [];
                for(var k in that.sea)
                {
                    if(that.sea[k].y < i)
                        newSea.push(TETRIS.cell({x : that.sea[k].x, y : that.sea[k].y + 1, color : that.sea[k].color}));
                    else
                        if(that.sea[k].y > i)
                            newSea.push(that.sea[k]);
                }
                that.sea = newSea;
            }
        }
        
        return full_lines;
    };

    var sinkPiece = function()
    {
        if(!that.piece)
            return;

        that.sea = that.sea.concat(that.piece.cells);
        
        that.piece = null;
        
        that.lineCount += pumpoutSea();

        adjustScoreSpeedDelay();
        
        postUpdate();                
    };

    var stopTimer = function()
    {
        clearInterval(timer);
    };

    var gameOver = function()
    {
        stopTimer();
        that.piece = null;
        that.gameState = TETRIS.GameState.GAMEOVER;
        postUpdate();
    };

    var newPiece = function()
    {
        that.piece = that.nextPiece.makeTranslated(that.width / 2 - 2, 0);
        if(isSeaOverlapping(that.piece))
        {
            gameOver();
            return;
        }
        
        that.pieceCount++;
        
        adjustScoreSpeedDelay();
        
        that.nextPiece = getRandomPiece();
        
        moveTimer = delay;
        
        postUpdate();
    };

    var timerEventHandler = function()
    {
        // console.log('tick, tetrisEngine: ' + that);
        // console.log('state: ' + that.gameState);
        
        if(moveTimer !== 0)
        {
            moveTimer--;
                return;
        }

        if(that.gameState === TETRIS.GameState.RUNNING)
        {
            if(!that.piece)
            {
                newPiece();
                return;
            }

            if(!translatePiece(0, 1))
            {
                sinkPiece();
                return;
            }
            
            moveTimer = delay;
            
            return;
        }
        else if(that.gameState === TETRIS.GameState.FREEFALL)
        {
            if(!that.piece)
            {
                that.gameState = TETRIS.GameState.RUNNING;
                
                return;
            }

            if(!translatePiece(0, 1))
            {
                sinkPiece();
                return;
            }
            
            moveTimer = FREEFALL_DELAY;
            
            return;
        }
        else
        {
            return;
        }
    };
    
    var startTimer = function()
    {
        timer = setInterval(timerEventHandler, TIMERTICK);
    };

    var freeFall = function()
    {
        if(that.gameState === TETRIS.GameState.RUNNING)
        {
            that.gameState = TETRIS.GameState.FREEFALL;
            moveTimer = 0;
        }
    };

    that.toString = function()
    {
        var res = 'tetris: ';
        
        res += 'width: ' + that.width + ', ';
        res += 'height: ' + that.height + ', ';
        res += 'lineCount: ' + that.lineCount + ', ';
        res += 'pieceCount: ' + that.pieceCount + ', ';
        res += 'score: ' + that.score + ', ';
        res += 'speed: ' + that.speed + ', ';
        res += 'delay: ' + delay + ', ';
        res += 'moveTimer: ' + moveTimer + ', ';
        res += 'gameState: ' + that.gameState + ', ';
        res += 'nextPiece: ' + that.nextPiece + ', ';
        res += 'piece: ' + that.piece + ', ';
        res += 'sea: ' + that.sea;
        
        return res;
    };
    
    that.start = function()
    {
        if(that.gameState === TETRIS.GameState.IDLE)
        {
            that.gameState = TETRIS.GameState.RUNNING;                
            startTimer();                
            postUpdate();
        }
    };
    
    that.stop = function()
    {
        if(that.gameState !== TETRIS.GameState.IDLE)
        {
            stopTimer();
            
            initParameters();                
            initSea();                
            initPieces();
            
            gameState = TETRIS.GameState.IDLE;
            postUpdate();
        }
    };
    
    that.pause = function()
    {
        if(that.gameState === TETRIS.GameState.RUNNING)
        {
            that.gameState = TETRIS.GameState.PAUSED;
            stopTimer();
            postUpdate();
        }                
    };
            
    that.resume = function()
    {
        if(that.gameState === TETRIS.GameState.PAUSED)
        {        
            that.gameState = TETRIS.GameState.RUNNING;
            startTimer();
            postUpdate();
        }                
    };

    var isInputAccepted = function()
    {
        if(that.gameState === TETRIS.GameState.RUNNING || that.gameState === TETRIS.GameState.FREEFALL)
            return true;
        return false;
    };

    that.movePieceLeft = function()
    {
        if(isInputAccepted())
            translatePiece(-1, 0);                
    };

    that.movePieceRight = function()
    {
        if(isInputAccepted())
            translatePiece(1, 0);
    };
    
    that.rotatePieceCounterclockwise = function()
    {
        if(isInputAccepted())
            rotatePiece(TETRIS.Direction.COUNTERCLOCKWISE);
    };
    
    that.rotatePieceClockwise = function()
    {
        if(isInputAccepted())
            rotatePiece(TETRIS.Direction.CLOCKWISE);
    };
    
    that.dropPiece = function()
    {
        if(that.gameState === TETRIS.GameState.RUNNING)
            freeFall();
    };
        
    that.addListener = function(listener)
    {
        listeners.push(listener);
    };
    
    that.removeListener = function(listener)
    {
        var newListeners = [];
        for(var i in that.listeners)
            if(that.listeners[i] !== listener)
                newListeners.push(that.listeners[i]);
        that.listeners = newListeners;
    };
        
    initParameters();
    
    initSea();
    
    initPieces();
        
    return that;
};

TETRIS.rect = function(spec)
{
    var that = {};
    
    that.left = spec.left;
    that.top = spec.top;
    that.right = spec.right;
    that.bottom = spec.bottom;
    
    that.width = function()
    {
        return that.right - that.left;
    };
    
    that.height = function()
    {
        return that.bottom - that.top;
    };

    return that;
};

TETRIS.point = function(spec)
{
    var that = {};
    
    that.x = spec.x;
    that.y = spec.y;
    
    return that;
};

TETRIS.tetrisView = function(spec)
{
    var GLASS_WIDTH = 10;
    var GLASS_HEIGHT = 20;
    var PREVIEW_WIDTH = 5;
    var PREVIEW_HEIGHT = 5;
    var GRID_COLOR = '#404040';
    var FIELD_COLOR = 'black';
    var SCREEN_SIZE_RATIO = 0.75;

    var that = {};
    var tetrisEngine;        
    var previousGameState;
    var cellSize;
    var colorToImage;

    var windowHeight = spec.windowHeight;
    var windowWidth = spec.windowWidth;
    
    // UI elements to bind to
    var previewCanvas = spec.previewCanvas;
    var gameCanvas = spec.gameCanvas;
    
    var dropButton = spec.dropButton;
    var moveLeftButton = spec.moveLeftButton;
    var moveRightButton = spec.moveRightButton;
    var rotateClockwiseButton = spec.rotateClockwiseButton;
    var rotateCounterClockwiseButton = spec.rotateCounterClockwiseButton;

    var newGameButton = spec.newGameButton;
    var pauseButton = spec.pauseButton;
    var highScoreButton = spec.highScoreButton;
    var previewCheckBox = spec.previewCheckBox;
    var gridCheckBox = spec.gridCheckBox;

    var scoreSpan = spec.scoreSpan;
    var speedSpan = spec.speedSpan;
    var linesSpan = spec.linesSpan;
    var piecesSpan = spec.piecesSpan;

    var getCellSize = function()
    {
        var res = TETRIS.round(Math.min(windowHeight * SCREEN_SIZE_RATIO / tetrisEngine.height,
            windowWidth * SCREEN_SIZE_RATIO / (tetrisEngine.width + PREVIEW_WIDTH)));
        return res;
    };
        
    var getCellRect = function(cell, offsetPoint)
    {
        var left = offsetPoint.x + cell.x * cellSize;
        var top = offsetPoint.y + cell.y * cellSize;
        var right = left + cellSize;
        var bottom = top + cellSize;
        
        return TETRIS.rect({left : left, top : top, right : right, bottom : bottom});
    };

    var getGlassHeight = function()
    {
        return tetrisEngine.height * cellSize;
    };
        
    var getGlassWidth = function()
    {
        return tetrisEngine.width * cellSize;
    };

    var getPreviewHeight = function()
    {
        return PREVIEW_HEIGHT * cellSize;
    };

    var getPreviewWidth = function()
    {
        return PREVIEW_WIDTH * cellSize;
    };
        
    var getPreviewCellOffset = function()
    {
        var minX = PREVIEW_WIDTH;
        var maxX = 0;
        var minY = PREVIEW_HEIGHT;
        var maxY = 0;
        for(var i in tetrisEngine.nextPiece.cells)
        {
            if(tetrisEngine.nextPiece.cells[i].x > maxX)
                maxX = tetrisEngine.nextPiece.cells[i].x;
            if(tetrisEngine.nextPiece.cells[i].x < minX)
                minX = tetrisEngine.nextPiece.cells[i].x;
            if(tetrisEngine.nextPiece.cells[i].y > maxY)
                maxY = tetrisEngine.nextPiece.cells[i].y;
            if(tetrisEngine.nextPiece.cells[i].y < minY)
                minY = tetrisEngine.nextPiece.cells[i].y;
        }
        var x = TETRIS.round(PREVIEW_WIDTH * cellSize / 2 - cellSize * (minX + maxX + 1) / 2);
        var y = TETRIS.round(PREVIEW_HEIGHT * cellSize / 2 - cellSize * (minY + maxY + 1) / 2);        
        
        return TETRIS.point({x : x, y : y});
    };
    
    var drawCellIntoRect = function(canvas, cell, rect)
    {
        var image = new Image();
        image.src = '/script/' + colorToImage[cell.color.name];
        
        canvas.getContext('2d').drawImage(image, rect.left, rect.top, rect.width(), rect.height());        
    };

    var drawCell = function(cell)
    {
        return drawCellIntoRect(gameCanvas, cell, getCellRect(cell, TETRIS.point({x : 0, y : 0})));
    };
        
    var drawPreviewCell = function(cell)
    {
        return drawCellIntoRect(previewCanvas, cell, getCellRect(cell, getPreviewCellOffset()));
    };

    var drawGrid = function()
    {
        for (var i = 0; i < tetrisEngine.width; i++)
        {
            gameCanvas.getContext('2d').beginPath();
            gameCanvas.getContext('2d').lineWidth = 1;
            gameCanvas.getContext('2d').strokeStyle = GRID_COLOR;
            gameCanvas.getContext('2d').moveTo(i * cellSize, 0);
            gameCanvas.getContext('2d').lineTo(i * cellSize, getGlassHeight());
            gameCanvas.getContext('2d').stroke();
        }

        for (var i = 0; i < tetrisEngine.height; i++)
        {
            gameCanvas.getContext('2d').beginPath();
            gameCanvas.getContext('2d').lineWidth = 1;
            gameCanvas.getContext('2d').strokeStyle = GRID_COLOR;
            gameCanvas.getContext('2d').moveTo(0, cellSize * i);
            gameCanvas.getContext('2d').lineTo(getGlassWidth(), cellSize * i);
            gameCanvas.getContext('2d').stroke();
        }
    }

    var drawStats = function()
    {
        scoreSpan.text(tetrisEngine.score);
        speedSpan.text(tetrisEngine.speed);
        piecesSpan.text(tetrisEngine.pieceCount);
        linesSpan.text(tetrisEngine.lineCount);
    }
        
    var drawSea = function()
    {
        if(tetrisEngine.sea)
            for(var i in tetrisEngine.sea)
            {
                drawCell(tetrisEngine.sea[i]);
            }
    };
        
    var drawPiece = function()
    {
        if(tetrisEngine.piece)
            for(var i in tetrisEngine.piece.cells)
            {
                drawCell(tetrisEngine.piece.cells[i]);
            }
    };
        
    var drawPreview = function()
    {
        if(tetrisEngine.nextPiece)
            for(var i in tetrisEngine.nextPiece.cells)
            {
                drawPreviewCell(tetrisEngine.nextPiece.cells[i]);
            }
    };
    
    var initTetrisEngine = function()
    {
        tetrisEngine = TETRIS.tetrisEngine({width : GLASS_WIDTH, height : GLASS_HEIGHT});
    };

    var initCellSize = function()
    {
        cellSize = getCellSize();    
    };

    var cleanCanvas = function(canvas)
    {
        canvas.getContext('2d').fillStyle = FIELD_COLOR;
        canvas.getContext('2d').rect(0, 0, canvas.width, canvas.height);
        canvas.getContext('2d').fill();
    };

    var initColorToImage = function()
    {
        colorToImage = {};
        colorToImage[TETRIS.Color.CYAN.name] = 'cell_cyan.png';
        colorToImage[TETRIS.Color.BLUE.name] = 'cell_blue.png';
        colorToImage[TETRIS.Color.ORANGE.name] = 'cell_orange.png';
        colorToImage[TETRIS.Color.YELLOW.name] = 'cell_yellow.png';
        colorToImage[TETRIS.Color.GREEN.name] = 'cell_green.png';
        colorToImage[TETRIS.Color.PURPLE.name] = 'cell_magenta.png';
        colorToImage[TETRIS.Color.RED.name] = 'cell_red.png';
    };

    var initGameCanvasSize = function()
    {
        gameCanvas.height = getGlassHeight();
        gameCanvas.width = getGlassWidth();
        cleanCanvas(gameCanvas);
    }

    var initPreviewCanvasSize = function()
    {
        previewCanvas.height = getPreviewHeight();
        previewCanvas.width = getPreviewWidth();
        cleanCanvas(previewCanvas);
    }

    var initControls = function()
    {
        initMovementButtons();
        
        initNewGameButton();
        
        initPauseButton();
        
        initPreviewCheckbox();
        
        initGridCheckBox();
        
        initInputHandling();
    };

    var initInputHandling = function()
    {
        document.onkeypress = handleKeypress;
        document.onkeydown = handleKeydown;
    };

    var handleKeypress = function(e)
    {
        if(typeof(e) === 'undefined')
            e = window.event;

        if((e.charCode || e.keyCode) === 32)
            tetrisEngine.dropPiece();
    };

    var handleKeydown = function(e)
    {
        if(typeof(e) === 'undefined')
            e = window.event;

        if(e.keyCode === 37)
            tetrisEngine.movePieceLeft();

        if(e.keyCode === 39)
            tetrisEngine.movePieceRight();

        if(e.keyCode === 40)
            tetrisEngine.rotatePieceClockwise();

        if(e.keyCode === 38)
            tetrisEngine.rotatePieceCounterclockwise();
    };

    var initMovementButtons = function()
    {
        dropButton.click(function()
        {
            tetrisEngine.dropPiece();
        });
    
        moveLeftButton.click(function()
        {
            tetrisEngine.movePieceLeft();
        });
    
        moveRightButton.click(function()
        {
            tetrisEngine.movePieceRight();
        });
    
        rotateClockwiseButton.click(function()
        {
            tetrisEngine.rotatePieceClockwise();
        });
    
        rotateCounterClockwiseButton.click(function()
        {
            tetrisEngine.rotatePieceCounterclockwise();
        });
    };
    
    var initNewGameButton = function()
    {
        newGameButton.click(function()
        {
            tetrisEngine.stop();
            tetrisEngine.start();
            
            pauseButton.val('Pause');
        });
    };

    var initPauseButton = function()
    {
        pauseButton.click(function()
        {
            if(tetrisEngine)
            {
                if(tetrisEngine.gameState === TETRIS.GameState.PAUSED)
                {	
                    pauseButton.val('Pause');
                    tetrisEngine.resume();
                }
                else if(tetrisEngine.gameState === TETRIS.GameState.RUNNING)
                {	
                    pauseButton.val('Resume');
                    tetrisEngine.pause();
                }
            }
        });
    };
        
    var initPreviewCheckbox = function()
    {
        previewCheckBox.prop('checked', true);
        previewCheckBox.click(function()
        {
            refresh();
        });
    };
        
    var initGridCheckBox = function()
    {
        gridCheckBox.prop('checked', true);
        gridCheckBox.click(function()
        {
            refresh();
        });
    };

    var refresh = function()
    {
        cleanCanvas(previewCanvas);

        cleanCanvas(gameCanvas);

        if (gridCheckBox.prop('checked'))
        {
            drawGrid();
        }

        drawSea();

        drawPiece();

        if (previewCheckBox.prop('checked'))
        {
            drawPreview();
        }

        drawStats();
    }

    that.changeNotify = function(tetrisEngine)
    {
        if(tetrisEngine.gameState === TETRIS.GameState.GAMEOVER && tetrisEngine.gameState !== previousGameState)
            window.alert('Game over!');
        previousGameState = tetrisEngine.gameState;

        refresh();
    };

    initTetrisEngine()
    
    initCellSize();
    
    initColorToImage();
    
    initGameCanvasSize();
    
    initPreviewCanvasSize();
    
    initControls();

    tetrisEngine.addListener(that);

    tetrisEngine.start();

    return that;
};

TETRIS.main = function(spec)
{
    var view = TETRIS.tetrisView(spec);
};
