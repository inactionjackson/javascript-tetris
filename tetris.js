const STARTING_Y = 10; // starting height of new tetro
const gridHeight = 20; // actual size of first dimension in gameGrid
const gridWidth = 12; // actual size of second dimension in gameGrid
const gridSpacing = 20; // pixel size of each square, only used when rendering
const gameGrid = [];
const blankRow = []; // used to easily create empty rows after match
const colors=["red","blue","green","purple","orange","magenta","silver","cyan"];
let clearedRows = []; // used for animation effect, no affect on gameplay
let score = 0;
let nextMove = {x:0} // buffers user input for next frame, gets cleared at end of frame
let nextRotate = 0;
let bShouldMoveDown = false;
let vertMoveTime = 1000;
let vertMoveTimer = 0;

const shapes = {
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
    for(let y=0;y<gridHeight;y++){
        gameGrid[y] = [];
        for(let x=0;x<gridWidth;x++){
            gameGrid[y][x] = 0;
            if(blankRow.length<gridWidth){
                blankRow.push(0);
            }
        }
    }
}
class Tetro{
    //Test branch
    constructor(shape,startingX){
        this.rotation = 0;
        this.oldRotation = this.rotation;
        this.shapeLetter = shape;
        this.shape = shapes[this.shapeLetter][this.rotation];
        this.x = startingX;
        this.y = STARTING_Y;
        this.color = random(colors)
        this.oldX = this.x;
        this.oldY = this.y;
        
    }
    rotate(){
        //FIXME : leaves chunks and causes move/collission check functions to break
        if(nextRotate !== 0){
            let oldCpoyRotation = this.oldRotation;
            this.oldRotation = this.rotation;
            this.rotation += nextRotate;
            if(this.rotation > shapes[this.shapeLetter].length-1){
                this.rotation = 0;
            }else if(this.rotation <0){
                this.rotation = shapes[this.shapeLetter].length-1;
            }
            
            //this.rotation = Math.max(this.rotation,shapes[this.shapeLetter].length-1)
            clearPieceFromGrid(this);
            this.shape =shapes[this.shapeLetter][this.rotation];
            if(checkCollision(this)){
                this.rotation = this.oldRotation;
                this.oldRotation = this.oldCpoyRotation;
                copyPieceToGrid(this);
                this.rotate();
            }
            copyPieceToGrid(this);
        }
        nextRotate = 0;
    }
    
}


function copyPieceToGrid(t){
    
    for(let y=0;y<t.shape.length;y++){
        for(let x=0;x<t.shape[y].length;x++){
            if(t.shape[y][x] !==0){
                gameGrid[t.y+y][t.x+x] = t.color;
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
                    
                    gameGrid[t.oldY+y][t.oldX+x] = 0;
                }
            }
        }
    }else{
        console.log(t);
    }
}
function moveTetro(t){ //something wrong here that is causing chunks to be left behind when rotating
    if(bShouldMoveDown){
        bShouldMoveDown = false;
        t.oldX = t.x;
        t.oldY = t.y;
        let newY = t.y+1;
        t.y = (Math.max(Math.min(newY,gridHeight),0)); // move y only
        clearPieceFromGrid(t);
        if(checkCollision(t)){ //Vertical check
            t.y = t.oldY;
            copyPieceToGrid(t);
            let b = new Tetro("t",5);
            if(checkCollision(b)){
                console.log("game over");
                //TODO: actually end game
            }else{
                return new Tetro("t",5);
            }
        }
        let newX = t.x+nextMove.x;
        t.x = (Math.max(Math.min(newX,gridWidth),0)); // move x only
        clearPieceFromGrid(t);
        if(checkCollision(t)){ //Horizontal check
            t.x = t.oldX;
        }
        copyPieceToGrid(t);
    }else if(nextMove.x !== 0){
        t.oldX = t.x;
        t.oldY = t.y;
        let newX = t.x+nextMove.x;
        t.x = (Math.max(Math.min(newX,gridWidth),0)); // move x only
        clearPieceFromGrid(t);        
        if(checkCollision(t)){ //Horizontal check
            t.x = t.oldX;
        }
        copyPieceToGrid(t);
    }
    clearPieceFromGrid(t);
    copyPieceToGrid(t);
    nextMove.x = 0;
    return t;
}

function checkCollision(t){
    if(t.oldX === t.x && t.oldY === t.y){
        return false;
    }
    for(let y=0;y<t.shape.length;y++){
        for(let x=0;x<t.shape[y].length;x++){
            if(t.y+y >= gameGrid.length || t.y+y <0 || t.x+x >=gameGrid[0].length || t.x+x < 0){
                return true;
            }
            if(gameGrid[t.y+y][t.x+x]  !== 0 && t.shape[y][x] !== 0){
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
    for(let y=0;y<gameGrid.length;y++){
        let bNotFilledRow = row.some(i => i<=0);
        if(!bNotFilledRow){
            numOfmatches++;
            matchedRows.push(y);
            clearedRows.push(y);
        }
    }
    matchedRows.forEach(r => {
        gameGrid.splice(r,1);
        gameGrid.push(blankRow.slice(0)); //might need changed to insert from other side
    });
    score += numOfmatches*numOfmatches;
}

//TODO: add rotation of pieces