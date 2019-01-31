let lastTime = 0;
let deltaTime = 0;
var testTetro;
function setup() {
  createCanvas(GRID_HEIGHT*GRID_SPACING+1,GRID_HEIGHT*GRID_SPACING+1);

  testTetro = new Tetro("t");
  setFrameRate(15);
  setUpGameGrid()
}

function draw() {
  
  clear();

  testTetro.rotate();
  testTetro.moveHorizontal();
  deltaTime = millis()-lastTime;
  lastTime = millis();
  vertMoveTimer += deltaTime;
  if(vertMoveTimer >= vertMoveTime || bShouldMoveDown){
    vertMoveTimer = 0;
    testTetro.moveVertical();
  }
 
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
  noStroke();
  if(testTetro !== undefined && testTetro !== null){
    for(let y=0;y<testTetro.shape.length;y++){
      for(let x=0;x<testTetro.shape[y].length;x++){
        if(testTetro.shape[y][x] !== 0){
          fill(color(testTetro.shape[y][x]));
          rect(((testTetro.x + x)*GRID_SPACING),((testTetro.y + y)*GRID_SPACING),GRID_SPACING,GRID_SPACING)
        }
      }
    }
  }
  for(let y=0;y<GAME_GRID.length;y++){
    for(let x=0;x<GAME_GRID[y].length;x++){
      
      if(GAME_GRID[y][x] !== 0){
        strokeWeight(2);
        stroke("black");
        fill(color(GAME_GRID[y][x]));
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
      vertMoveTimer = vertMoveTime;
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