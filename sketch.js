
let lastTime = 0;
let deltaTime = 0;
let activePiece;
const GAME_GRID = new GameGrid(GRID_HEIGHT,GRID_WIDTH,0);
const FLASH_COLOR = "green";
const FLASH_TIME_LIMIT =60;
let flashTimer = FLASH_TIME_LIMIT;
let bIsFlashing = false;

function setup() {
  createCanvas(GRID_HEIGHT*GRID_SPACING+1,GRID_HEIGHT*GRID_SPACING+1);

  activePiece = new Piece(GAME_GRID);
  setFrameRate(15);
}

function draw() {
  clear();

  //updeate piece position
  activePiece.rotate();
  activePiece.moveHorizontal();

  //get time since last frame
  deltaTime = millis()-lastTime;
  lastTime = millis();
  // update timers
  verticalMoveTimer += deltaTime;
  if(bIsFlashing){
    flashTimer -= deltaTime;
  }
  

  if(verticalMoveTimer >= verticalMoveTimeLimit || bShouldMoveDown){
    verticalMoveTimer = 0;
    activePiece.moveVertical();
  }
 
  drawGame();
  flashClearedRows();
}

function drawGame(){
  noStroke();
  if(activePiece !== undefined && activePiece !== null){
    for(let y=0;y<activePiece.shape.length;y++){
      for(let x=0;x<activePiece.shape[y].length;x++){
        if(activePiece.shape[y][x] !== 0){
          strokeWeight(2);
          stroke("black");
          fill(color(activePiece.color));
          rect(((activePiece.x + x)*GRID_SPACING),((activePiece.y + y)*GRID_SPACING),GRID_SPACING,GRID_SPACING)
        }
      }
    }
  }
  for(let y=0;y < GRID_HEIGHT;y++){
    for(let x=0;x < GRID_WIDTH ;x++){
      
      if(GAME_GRID.grid[y][x] !== 0){
        strokeWeight(2);
        stroke("grey");
        fill(color(GAME_GRID.grid[y][x]));
        rect((x*GRID_SPACING),(y*GRID_SPACING),GRID_SPACING,GRID_SPACING)
      }else{
        noFill();
        strokeWeight(1);
        stroke("grey")
        rect((x*GRID_SPACING),(y*GRID_SPACING),GRID_SPACING,GRID_SPACING)
      }
    }
  }
}

function flashClearedRows(){
  if(clearedRows.length !== 0){
    bIsFlashing = true;
    fill(color(FLASH_COLOR));
    for(let i = 0; i < clearedRows.length; i++){
      rect(0,clearedRows[i] * GRID_SPACING,GRID_WIDTH*GRID_SPACING,GRID_SPACING+(GRID_SPACING*.25));
    }
    if(flashTimer < 0){
      clearedRows.splice(0,clearedRows.length);
      flashTimer = FLASH_TIME_LIMIT;
      bIsFlashing = false;
    }
  }

}

function keyPressed(){
  //TODO: make it possible to hold down a button
  let key = keyCode;
  switch(key){
    case LEFT_ARROW:
      nextMoveX = -1;
      break;
    case RIGHT_ARROW:
      nextMoveX = 1;
      break;
    case DOWN_ARROW:
      verticalMoveTimer = verticalMoveTimeLimit;
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