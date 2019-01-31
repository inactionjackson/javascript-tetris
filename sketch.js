let lastTime = 0;
let deltaTime = 0;
var testTetro;
function setup() {
  createCanvas(gridWidth*gridSpacing+1,gridHeight*gridSpacing+1);

  testTetro = new Tetro("t",5);
  setFrameRate(15);
  setUpGameGrid()
  copyPieceToGrid(testTetro);
}

function draw() {
  deltaTime = millis()-lastTime;
  lastTime = millis();
  vertMoveTimer += deltaTime;
  if(vertMoveTimer >= vertMoveTime){
    vertMoveTimer = 0;
    bShouldMoveDown = true;
  }
  clear();
  //copyPieceToGrid(testTetro);
  //clearPieceFromGrid(testTetro);
  testTetro.rotate();

  //testTetro = moveTetro(testTetro);
 
  drawGame();
}

function drawTetro(t){
  for(let y=0;y<t.length;y++){
    for(let x=0;x<t[y].length;x++){
      if(t[y][x] != 0){
        fill("blue");
        rect(100+(x*10),100+(y*10),10,10)
      }
    }
  }
}

function drawGame(){
  //noStroke();
  for(let y=0;y<gameGrid.length;y++){
    for(let x=0;x<gameGrid[y].length;x++){
      
      if(gameGrid[y][x] !== 0){
        strokeWeight(2);
        stroke("black");
        fill(color(gameGrid[y][x]));
        rect((x*gridSpacing),(y*gridSpacing),gridSpacing,gridSpacing)
      }else{
        noFill();
        strokeWeight(1);
        stroke("grey")
        rect((x*gridSpacing),(y*gridSpacing),gridSpacing,gridSpacing)
      }
    }
  }
}

function flashClearedRows(){
  //TODO: make animated delayed flash when rows are match
}

function keyPressed(){
  let key = keyCode;
  switch(key){
    case LEFT_ARROW:
      nextMove.x = -1;
      break;
    case RIGHT_ARROW:
      nextMove.x = 1;
      break;
    case DOWN_ARROW:
      bShouldMoveDown = true;
      break;
    case SHIFT:
      nextRotate = -1;
      break;
    case CONTROL:
      nextRotate = 1;
      break;
    default:
      break;
  }
}