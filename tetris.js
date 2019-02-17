const GRID_SPACING = 20; // pixel size of each square, only used when rendering
const GRID_HEIGHT = 20; // actual size of first dimension in gameGrid
const GRID_WIDTH = 12; // actual size of second dimension in gameGrid
const STARTING_Y = 0; // starting height of new tetro
const STARTING_X = Math.round(GRID_WIDTH / 2);
const COLORS = ["red", "blue", "green", "purple", "orange", "magenta", "silver", "cyan"];
const clearedRows = []; // used for animation effect, no affect on gameplay
let score = 0;
let nextMoveX =  0  // buffers user input for next frame, gets cleared at end of frame
let nextRotate = 0;
let bShouldMoveDown = false;
let verticalMoveTimeLimit = 10000;
let verticalMoveTimer = 0;
let nextLetter = "";

class GameGrid{
    constructor(height,width,defaultValue = 0){
        this.grid = create2dArray(GRID_HEIGHT,GRID_WIDTH,defaultValue);
        this.height = height;
        this.width = width;
    }

    copyPieceToGrid(t) {

        for (let y = 0; y < t.shape.length; y++) {
            for (let x = 0; x < t.shape[y].length; x++) {
                if (t.shape[y][x] !== 0) {
                    this.grid[t.y + y][t.x + x] = t.color;
                }
            }
        }
    }

    checkCollision(t) {
        for (let y = 0; y < t.shape.length; y++) {
            for (let x = 0; x < t.shape[y].length; x++) {
                if (t.y + y >= this.height) {
                    return true;
                }
                if (this.grid[t.y + y][t.x + x] !== 0 && t.shape[y][x] !== 0) {
                    return true;
                }
    
            }
        }
        return false;
    }

    checkRows() {
        let numOfmatches = 0;
        let matchedRows = [];
        for (let y = 0; y < this.height; y++) {
            let bNotFilledRow = this.grid[y].some(i => i <= 0);
            if (!bNotFilledRow) {
                numOfmatches++;
                matchedRows.push(y);
                clearedRows.push(y);
            }
        }
        //TODO: implement flood fill
        matchedRows.forEach(r => {
            this.grid.splice(r, 1);
            this.grid.unshift(new Array(this.width).fill(0));
            verticalMoveTimeLimit -= 30;
        });
        score += numOfmatches * numOfmatches;
    }
}


class Piece {
    SHAPES = {
        t: [
            [1, 1, 1],
            [0, 1, 0]
        ],
        l: [
            [1, 1],
            [0, 1],
            [0, 1]
        ],
        j:[
            [1, 1],
            [1, 0],
            [1, 0]
        ],
        i: [
            [1],
            [1],
            [1],
            [1]
        ],
        o:[
            [1,1],
            [1,1]
        ],
        s:[
            [0,1,1],
            [1,1,0]
        ],
        z:[
            [1,1,0],
            [0,1,1]
            
        ]
    };
    
    constructor(grid) {
        this.grid = grid;
        this.nextLetter = this.getRandomLetter();
        this.reset();
    }
    reset() {
        this.rotation = 0;
        this.oldRotation = this.rotation;
        this.shapeLetter = this.nextLetter;
        this.nextLetter = this.getRandomLetter();
        this.shape = this.SHAPES[this.shapeLetter];
        this.x = STARTING_X;
        this.y = STARTING_Y;
        this.getColor();
        this.oldX = this.x;
        this.oldY = this.y;
    }
    rotate(bShouldForce = false) {
        if (nextRotate !== 0 || bShouldForce) {
            let copyOldRotation = this.oldRotation; // have to go 2 deep on rotation history since a collision results in this being called recursively 
            this.oldRotation = this.rotation;
            this.rotation += nextRotate;

            if (this.rotation > 3) {
                this.rotation = 0;
            } else if (this.rotation < 0) {
                this.rotation = 3;
            }

            switch (this.rotation) {
                case 0: // default
                    this.shape = this.SHAPES[this.shapeLetter];
                    break;
                case 1: // 90CW rotation
                    this.shape = mirror2dArray(rotate2dArray90(this.SHAPES[this.shapeLetter]),"y");
                    break;
                case 2: // 180 rotation
                    this.shape = mirror2dArray(mirror2dArray(this.SHAPES[this.shapeLetter],"y"),"x");
                    break;
                case 3: // 270CW rotation
                    this.shape = mirror2dArray(rotate2dArray90(this.SHAPES[this.shapeLetter]),"x");
                    break;
                default:
                    break;
            }

            if (this.grid.checkCollision(this)) {
                nextRotate = 0;
                this.rotation = this.oldRotation;
                this.oldRotation = copyOldRotation;
                this.rotate(true);
            }
        }
        nextRotate = 0;
    }
    moveVertical() {
        this.oldX = this.x;
        this.oldY = this.y;
        let newY = this.y + 1;
        this.y = (Math.max(Math.min(newY, this.grid.height+1 - this.shape.length), 0));
        if (this.grid.checkCollision(this)) {
            //revert position and lock piece
            this.x = this.oldX;
            this.y = this.oldY;
            this.grid.copyPieceToGrid(this);
            this.reset();
            this.grid.checkRows();
            if(this.grid.checkCollision(this)){ 
                //check for game end
                console.log("game over")
                frameRate(0);
            }
        }
    }
    moveHorizontal() {
        this.oldX = this.x;
        this.oldY = this.y;
        let newX = this.x + nextMoveX;
        this.x = (Math.max(Math.min(newX, this.grid.width - this.shape[0].length), 0));
        nextMoveX = 0;
        if (this.grid.checkCollision(this)) {
            this.x = this.oldX;
            this.y = this.oldY;
        }
    }
    getRandomLetter(){
        //TODO: add logic to avoid too many of the same letters in a row
        let keys = Object.keys(this.SHAPES);
        return keys[Math.floor(Math.random()*keys.length)];
    }
    getColor(){
        switch(this.shapeLetter.toString()){
            case "i":
                this.color = "red";
                break;
            case "j":
                this.color = "magenta";
                break;
            case "l":
                this.color = "purple";
                break;
            case "o":
                this.color = "cyan";
                break;
            case "s":
                this.color = "blue";
                break;
            case "t":
                this.color = "silver";
                break;
            case "z":
                this.color = "green";
                break;
            default:
                this.color = "black";
                break;
        }
    }

}
