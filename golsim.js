/* Returns a Game of Life simulator object. The canvas is injected into the container element 
specified by containerId. Optional parameters are to be specified using object notation in the
second parameter. User configurable options with default values shown are: 

{
    width: 100,
    height: 100,
    worldWidth: 10,
    worldHeight: 10,
    msPerGeneration: 1000,
    cellColor: "#FF0000",
    backgroundColor: "#FFFFFF"
}

*/
var MakeGameOfLifeSimulator = function (containerId, params = {}) {
    var golWidget = {};
    
    var container = document.getElementById(containerId);
    if (container === null) {
        console.log("No valid container supplied! Need some element that can contain children.");    
    }
    
    var cnv = document.createElement("canvas");
    var ctx = cnv.getContext("2d");
    cnv.width = params.width || 100;
    cnv.height = params.height || 100;
    
    var worldWidth = params.worldWidth || 10;
    var worldHeight = params.worldHeight || 10;
    var msPerGeneration = params.msPerGeneration || 1000;
    var cellArray = [];

    var intervalId = null;
    var cellColor = params.cellColor || "#FF0000";
    var backgroundColor = params.backgroundColor || "#FFFFFF";
    
    var bPlaying = false;

    var mouseState = {
        bOverCanvas: false,
        x: 0,
        y: 0,
    }

    /* Erases the canvas to the backgroundColor */
    function clearCanvas() {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0,0,cnv.width,cnv.height);    
    }

    /* Returns true if sNum is a valid hex color eg: #FFAA00 */
    function isHexaColor(sNum){
        /* See here for color validation:
        https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
        */
        return (typeof sNum === "string") && sNum.length === 6 
            && ! isNaN( parseInt(sNum, 16) );
    }

    /* Sets the color cells are drawn with. Provide a hex value. */
    golWidget.setCellColor = function(cellColor) {
    	if (!isHexaColor(cellColor)) { 
            console.log("Invalid hexadecimal cell color.");
            return; 
        }
    	cellColor = cellColor;
    }

    /* Sets the color of the background */
    golWidget.setBackgroundColor = function(backgroundColor) {
        if (!isHexaColor(cellColor)) { 
            console.log("Invalid background color.");
            return; 
        }
    	backgroundColor = backgroundColor;
    }
    
    /* Returns 1 if cell at cellX,cellY is alive,
    or 0 otherwise. */
    golWidget.getCell = function(cellX, cellY) {
        if (cellX < 0) {
            cellX = worldWidth + cellX;
        }
        if (cellY < 0) {
            cellY = worldHeight + cellY;
        }
        var x = cellX % worldWidth;
        var y = cellY % worldHeight;
        //console.log(x + "," + y + ": " + (cellArray[(y * worldWidth) + x] ? 1 : 0));
        return (cellArray[(y * worldWidth) + x] ? 1 : 0);
    }
    
    /* Sets the state of the cell at cellX,cellY.
    state should be either 0 or 1. */
    golWidget.setCell = function(cellX, cellY, state) {
        if (cellX < 0) {
            cellX = worldWidth + cellX;
        }
        if (cellY < 0) {
            cellY = worldHeight + cellY;
        }
        var x = cellX % worldWidth;
        var y = cellY % worldHeight;
        
        cellArray[(y * worldWidth) + x] = (state ? 1 : 0);
        console.log(x + "," + y + ": " + (cellArray[(y * worldWidth) + x] ? 1 : 0));
        updateCanvas();
    }

    /* Toggles the state of the cell at cellX,cellY */
    golWidget.toggleCell = function(cellX, cellY) {
        if (1 == golWidget.getCell(cellX, cellY)) {
            golWidget.setCell(cellX, cellY, 0);
        } else {
            golWidget.setCell(cellX, cellY, 1);
        }
        console.log("Toggled cell: " + cellX + "," + cellY);
        updateCanvas();
    }
    
    /* Draws a cell-sized rectangle at CELL COORDINATES x,y.
    using the provided color. Color should be a hex value. */
    function drawCell(x,y,color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * (cnv.width / worldWidth), y * (cnv.height / worldHeight), (cnv.width / worldWidth), (cnv.height / worldHeight));
    }

    /* Renders the entire world to the canvas, including all
    live cells. */
    function updateCanvas() {
        clearCanvas();
        
        for (var y = 0; y < worldHeight; y++) {
            for (var x = 0; x < worldWidth; x++) {
                if (golWidget.getCell(x,y) == 1) {
                    drawCell(x,y,cellColor);
                    //ctx.fillStyle = cellColor;
                    //ctx.fillRect(x * (cnv.width / worldWidth), y * (cnv.height / worldHeight), (cnv.width / worldWidth), (cnv.height / worldHeight));
                    //console.log("cell at " + x + ", " + y);
                }    
            }
        }     
        drawMouseOverEffect();
        //console.log("updated canvas");
    }
    
    /* Calculates the next GoL generation and replaces
    cellArray with that newly calculated world state. */
    golWidget.simulateGeneration = function() {
        var newCellArray = [];
        for (var y = 0; y < worldHeight; y++) {
            for (var x = 0; x < worldWidth; x++) {
                var curState = golWidget.getCell(x,y);
                var numNeighbors = 0;
                numNeighbors += golWidget.getCell(x-1,y-1);
                numNeighbors += golWidget.getCell(x,y-1);
                numNeighbors += golWidget.getCell(x+1,y-1);
                numNeighbors += golWidget.getCell(x-1,y);
                numNeighbors += golWidget.getCell(x+1,y);
                numNeighbors += golWidget.getCell(x-1,y+1);
                numNeighbors += golWidget.getCell(x,y+1);
                numNeighbors += golWidget.getCell(x+1,y+1);
                if (curState == 1) {
                    if (numNeighbors < 2 || numNeighbors > 3) {
                        //cell dies
                        newCellArray[(y * worldWidth) + x] = 0;
                        //console.log("Cell at (" + x + "," + y + ") dies.");
                    } else if (numNeighbors == 2 || numNeighbors == 3) {
                        //cell remains alive
                        newCellArray[(y * worldWidth) + x] = 1;
                    }
                } else {
                    if (numNeighbors == 3) {
                        //cell is born
                        newCellArray[(y * worldWidth) + x] = 1;
                    }
                }
            }
        }
        cellArray = newCellArray;
        updateCanvas();
    }
    
    /* Pauses the simulation. */
    golWidget.pause = function() {
    	clearInterval(intervalId);
        bPlaying = false;
    }
    
    /* Starts the simulation running from it's current state. */
    golWidget.play = function() {
    	intervalId = setInterval(golWidget.simulateGeneration, msPerGeneration);
        bPlaying = true;
    }

    /* Toggles simulation playing/paused. */
    golWidget.togglePause = function() {
        if (bPlaying == false) {
            golWidget.play();
        } else {
            golWidget.pause();
        }
        console.log("Toggled pause.");
    }

    /* Inserts a valid life pattern at the CELL COORDINATES x,y.
    patternData should be only 1's, 0's and newlines. Any other
    characters encountered are ignored. */
    golWidget.insertPattern = function(x, y, patternData) {
        var iterX = 0;
        var iterY = 0;
        for (var i = 0; i < patternData.length; i++) {
            if (patternData[i] == '1') {
                golWidget.setCell(iterX + x, iterY + y, 1);
                iterX++;
            } else if (patternData[i] == '0') {
                golWidget.setCell(iterX + x, iterY + y, 0);
                iterX++;
            } else if (patternData[i] == '\n') {
                iterX = 0;
                iterY++;
            }
        }
    }

    /* Calculates the dimensions (in pixels) of a cell
    with the current simulation settings. Returns an object
    with the properties "width" and "height" set. */
    function cellDimsPx() {
        var dims = {
            width: cnv.width / worldWidth,
            height: cnv.height / worldHeight
        }
        return dims;
    }

    /* Calculates cell coordinates from a location
    specified in pixel coordinates, relative to the
    upper-left corner of the canvas. Returns an object
    with properties "x" and "y" set. */
    function cellCoords(xPos, yPos) {
        var cellX;
        var cellY;
        cellX = Math.floor(xPos / cellDimsPx().width);
        cellY = Math.floor(yPos / cellDimsPx().height);
        return {x: cellX, y: cellY}
    }

    /* This function is called when a mouse click is generated
    on the canvas at coordinates xPos,yPos. At the moment, it
    toggles the state of the cell under the mouse cursor. */
    golWidget.click = function(xPos, yPos) {
        var cell = cellCoords(xPos, yPos);
        console.log("Clicked at " + xPos + "," + yPos);
    
        golWidget.toggleCell(cell.x, cell.y);
    }

    /* Calculates the coordinates of a click on the canvas relative
    to the upper left corner, since by default click coordinates
    are delivered with respect to the whole page. */
    function relativeClickCoords(e) {
        var pos = {
            x: e.pageX - cnv.offsetLeft,
            y: e.pageY - cnv.offsetTop,
        }
        return pos;
    }

    /* Click event handler. */
    function clickEvent(e) {
        golWidget.click(relativeClickCoords(e).x, relativeClickCoords(e).y);
    }
    cnv.addEventListener('click', clickEvent);

    /* Renders the effect where cells are highlighted when the mouse
    is over them. */
    function drawMouseOverEffect() {
        //these two functions from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        /* Returns a color value linearly interpolated
        between two hex colors by proportion p. p should
        be in the range [0,1] */
        function lerpHexColor(color1, color2, p) {
            var c1 = hexToRgb(color1);
            var c2 = hexToRgb(color2);
            var out = {
                r: ((1 - p) * c1.r) + (p * c2.r),
                g: ((1 - p) * c1.g) + (p * c2.g),
                b: ((1 - p) * c1.b) + (p * c2.b),
            }
            return rgbToHex(out.r, out.g, out.b);
        }

        if (mouseState.bOverCanvas) {
            var cCoords = cellCoords(mouseState.x, mouseState.y);
            if (golWidget.getCell(cCoords.x, cCoords.y)) {
                drawCell(cCoords.x, cCoords.y, lerpHexColor(backgroundColor, cellColor, 0.8));
            } else {
                drawCell(cCoords.x, cCoords.y, lerpHexColor(backgroundColor, cellColor, 0.4));
            }
        }
    }

    /* When the mouse moves, we need to update which cell is highlighted
    via the drawMouseOverEffect() called by updateCanvas(). */
    golWidget.mouseMove = function(xPos, yPos) {
        console.log("Mouse at " + xPos + "," + yPos);
        mouseState.bOverCanvas = true;
        mouseState.x = xPos;
        mouseState.y = yPos;
        updateCanvas();
    }

    /* Mouse movement event handler. */
    function mouseMoveEvent(e) {
        golWidget.mouseMove(relativeClickCoords(e).x, relativeClickCoords(e).y);
    }
    cnv.addEventListener('mousemove', mouseMoveEvent);
    
    cnv.addEventListener('mouseleave', function(e) {
        mouseState.bOverCanvas = false;
    });

    /* Creates a DOM button object attached to this instance
    of the GoL simulator framework. The button will play/pause
    the simulation instance when clicked. Any styling or placement 
    will need to be handled by the caller as this function returns a
    basic DOM object. */
    golWidget.getPlayPauseButton = function() {
        function makePlayPauseButton() {
            var btn = document.createElement("button");
            btn.innerHTML = (bPlaying ? "Pause" : "Play");
            btn.addEventListener('click', function() {
                golWidget.togglePause();
                btn.innerHTML = (bPlaying ? "Pause" : "Play");
            });
            return btn;
        }

        return makePlayPauseButton();
    }

    container.appendChild(cnv);
    updateCanvas();
    return golWidget;
};
