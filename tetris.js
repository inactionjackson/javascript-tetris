const GRID_HEIGHT = 20; // actual size of first dimension in gameGrid
const GRID_WIDTH = 12; // actual size of second dimension in gameGrid
const STARTING_Y = 10; // starting height of new tetro
const STARTING_X = Math.round(GRID_WIDTH/2);
const GRID_SPACING = 20; // pixel size of each square, only used when rendering
const GAME_GRID = [];
const BLANK_ROW = []; // used to easily create empty rows after match
const COLORS=["red","blue","green","purple","orange","magenta","silver","cyan"];
let clearedRows = []; // used for animation effect, no affect on gameplay
let score = 0;
let nextMove = {x:0} // buffers user input for next frame, gets cleared at end of frame
let nextRotate = 0;
let bShouldMoveDown = false;
let vertMoveTime = 1000;
let vertMoveTimer = 0;

const SHAPES = {
    t:[
        [
            [1,1,1],
            [0,1,0],
            [0,1,0]
        ],
        [
            [0,0,1],
            [1,1,1],
            [0,0,1]
        ],
        [
            [0,1,0],
            [0,1,0],
            [1,1,1]
        ],
        [
            [1,0,0],
            [1,1,1],
            [1,0,0]
        ],
    ],
    l:[ [1,1],
        [0,1],
        [0,1]
    ],
    i:[ [1],
        [1],
        [1],
        [1]
    ]

};



function setUpGameGrid(){
    for(let y=0;y<GRID_HEIGHT;y++){
        GAME_GRID[y] = [];
        for(let x=0;x<GRID_WIDTH;x++){
            GAME_GRID[y][x] = 0;
            if(BLANK_ROW.length<GRID_WIDTH){
                BLANK_ROW.push(0);
            }
        }
    }
}
class Tetro{
    //Test branch
    constructor(shapeLetter){
        this.reset(shapeLetter);
    }
    reset(shapeLetter){
        console.log("resetting");
        this.rotation = 0;
        this.oldRotation = this.rotation;
        this.shapeLetter = shapeLetter;
        this.shape = SHAPES[this.shapeLetter][this.rotation];
        this.x = STARTING_X;
        this.y = STARTING_Y;
        this.color = random(COLORS)
        this.oldX = this.x;
        this.oldY = this.y;
    }
    rotate(){
        //console.log(nextRotate);
        //FIXME : leaves chunks and causes move/collission check functions to break
        if(nextRotate !== 0){
            let oldCpoyRotation = this.oldRotation;
            this.oldRotation = this.rotation;
            this.rotation += nextRotate;
            if(this.rotation > SHAPES[this.shapeLetter].length-1){
                this.rotation = 0;
            }else if(this.rotation <0){
                this.rotation = SHAPES[this.shapeLetter].length-1;
            }
            
            //this.rotation = Math.max(this.rotation,shapes[this.shapeLetter].length-1)
            this.shape =SHAPES[this.shapeLetter][this.rotation];
            if(checkCollision(this)){
                this.rotation = this.oldRotation;
                this.oldRotation = this.oldCpoyRotation;
                this.rotate();
            }
        }
        nextRotate = 0;
    }
    moveVertical(){
        this.oldX = this.x;
        this.oldY = this.y;
        let newY = this.y+1;
        this.y = (Math.max(Math.min(newY,GRID_HEIGHT-this.shape.length),0));
        if(this.y === 0){
            //lock Piece
        }else{
            //collision check
        }
    }
    moveHorizontal(){
        this.oldX = this.x;
        this.oldY = this.y;
        let newX = this.x+nextMove.x;
        this.x = (Math.max(Math.min(newX,GRID_WIDTH-this.shape[0].length),0));
        nextMove.x = 0;
        //check collision and revert if colliding
    }
    
}


function copyPieceToGrid(t){
    
    for(let y=0;y<t.shape.length;y++){
        for(let x=0;x<t.shape[y].length;x++){
            if(t.shape[y][x] !==0){
                GAME_GRID[t.y+y][t.x+x] = t.color;
            }
        }
    }
}
function clearPieceFromGrid(t){
    if(t.oldX !== t.x || t.oldY !== t.y || t.oldRotation !== t.rotation){
        //console.log(t.rotation);
        for(let y=0;y<t.shape.length;y++){
            for(let x=0;x<t.shape[y].length;x++){
                if(t.shape[y][x] != 0){
                    
                    GAME_GRID[t.oldY+y][t.oldX+x] = 0;
                }
            }
        }
    }else{
        console.log(t);
    }
}

function checkCollision(t){
    if(t.oldX === t.x && t.oldY === t.y){
        return false;
    }
    for(let y=0;y<t.shape.length;y++){
        for(let x=0;x<t.shape[y].length;x++){
            if(t.y+y >= GAME_GRID.length || t.y+y <0 || t.x+x >=GAME_GRID[0].length || t.x+x < 0){
                return true;
            }
            if(GAME_GRID[t.y+y][t.x+x]  !== 0 && t.shape[y][x] !== 0){
                return true;
            }
            
        }
    }
    return false;
}

/**
 * This should be called anytime a piece colides vertically, before new piece is spawned
 * 
 */
function checkRows(){
    let numOfmatches = 0;
    let matchedRows = [];
    for(let y=0;y<GAME_GRID.length;y++){
        let bNotFilledRow = row.some(i => i<=0);
        if(!bNotFilledRow){
            numOfmatches++;
            matchedRows.push(y);
            clearedRows.push(y);
        }
    }
    matchedRows.forEach(r => {
        GAME_GRID.splice(r,1);
        GAME_GRID.push(BLANK_ROW.slice(0)); //might need changed to insert from other side
    });
    score += numOfmatches*numOfmatches;
}

//TODO: add rotation of pieces