/** Uses p5.js for canvas rendering and frame timing */
let lastTime = 0;
let deltaTime = 0;
let activePiece;

const FRAME_RATE = 30;
const GAME_GRID = new GameGrid(GRID_HEIGHT, GRID_WIDTH);
const FLASH_COLOR = "lime";
const FLASH_TIME_LIMIT = 60;
const SIDE_X_PADDING = 10;
const SIDE_Y_PADDING = 10;
const SIDE_WIDTH = 100;
let flashTimer = FLASH_TIME_LIMIT;
let bIsFlashing = false;

let autoVerticalMoveTimer = 0;
let manualVerticalMoveTimer = 0;
let horizontalMoveTimer = 0;
const MANUAL_MOVE_TIME_LIMIT = 600;
let bisHorizontalButtonDown = false;
let bisVerticalButtonDown = false;

let bisPaused = true;

function setup() {
  let cnv = createCanvas(
    GRID_WIDTH * GRID_SPACING + 1 + SIDE_WIDTH,
    GRID_HEIGHT * GRID_SPACING + 1
  );
  let gameContainer = document.querySelector("#master");
  gameContainer.setAttribute(
    "max_width",
    GRID_WIDTH * GRID_SPACING + 1 + SIDE_WIDTH,
    GRID_HEIGHT * GRID_SPACING + 1
  );
  cnv.parent(gameContainer);
  activePiece = new Piece(GAME_GRID);

  setFrameRate(0);
}

function draw() {
  clear();
  //get time since last frame
  deltaTime = millis() - lastTime;
  lastTime = millis();
  // update timers
  autoVerticalMoveTimer += deltaTime;
  if (bisHorizontalButtonDown) {
    horizontalMoveTimer += deltaTime;
  }
  if (bisVerticalButtonDown) {
    manualVerticalMoveTimer += deltaTime;
  }
  if (bIsFlashing) {
    flashTimer -= deltaTime;
  }

  //updeate piece position
  activePiece.rotate();
  if (horizontalMoveTimer >= MANUAL_MOVE_TIME_LIMIT) {
    if (keyIsDown(LEFT_ARROW)) {
      nextMoveX = -1;
    } else if (keyIsDown(RIGHT_ARROW)) {
      nextMoveX = 1;
    }
  }

  activePiece.moveHorizontal();

  if (
    autoVerticalMoveTimer >= verticalMoveTimeLimit ||
    manualVerticalMoveTimer >= MANUAL_MOVE_TIME_LIMIT
  ) {
    autoVerticalMoveTimer = 0;
    if (activePiece.moveVertical()) {
      manualVerticalMoveTimer = 0;
    }
  }

  drawGameGrid();
  drawPiece(activePiece.shape, activePiece.x, activePiece.y, activePiece.color);
  drawSidePanel();
  flashClearedRows();
}

function drawGameGrid() {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (GAME_GRID.grid[y][x].a > 0) {
        strokeWeight(2);
        stroke(color(40, 40, 40));
        fill(
          color(
            GAME_GRID.grid[y][x].r,
            GAME_GRID.grid[y][x].b,
            GAME_GRID.grid[y][x].g
          )
        );
        rect(x * GRID_SPACING, y * GRID_SPACING, GRID_SPACING, GRID_SPACING);
      } else {
        fill(
          color(
            GAME_GRID.grid[y][x].r,
            GAME_GRID.grid[y][x].b,
            GAME_GRID.grid[y][x].g
          )
        );
        strokeWeight(1);
        stroke(color(100, 100, 100));
        rect(x * GRID_SPACING, y * GRID_SPACING, GRID_SPACING, GRID_SPACING);
      }
    }
  }
}

function drawPiece(shape, px, py, pcolor = "black") {
  noStroke();
  if (shape !== undefined && shape !== null) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          strokeWeight(2);
          stroke("black");
          fill(color(pcolor.r, pcolor.b, pcolor.g));
          rect(
            (px + x) * GRID_SPACING,
            (py + y) * GRID_SPACING,
            GRID_SPACING,
            GRID_SPACING
          );
        }
      }
    }
  }
}

function drawSidePanel() {
  fill(0);
  textSize(20);
  text(
    score.toString().padStart(8, 0),
    GRID_WIDTH * GRID_SPACING + SIDE_X_PADDING,
    SIDE_Y_PADDING + 10
  );
  drawPiece(
    activePiece.getShapes()[activePiece.nextLetter],
    GRID_WIDTH + 1.5,
    2,
    { r: 177, g: 177, b: 177 }
  );
}

function flashClearedRows() {
  if (clearedRows.length > 0) {
    bIsFlashing = true;
    fill(color(FLASH_COLOR));
    for (let i = 0; i < clearedRows.length; i++) {
      rect(
        0,
        clearedRows[i] * GRID_SPACING,
        GRID_WIDTH * GRID_SPACING,
        GRID_SPACING * 1.25
      );
    }
    if (flashTimer < 0) {
      clearedRows.splice(0, clearedRows.length);
      flashTimer = FLASH_TIME_LIMIT;
      bIsFlashing = false;
    }
  }
}

function keyPressed() {
  let key = keyCode;
  switch (key) {
    case LEFT_ARROW:
      nextMoveX = keyIsDown(RIGHT_ARROW) ? 0 : -1;
      bisHorizontalButtonDown = true;
      break;
    case RIGHT_ARROW:
      nextMoveX = keyIsDown(LEFT_ARROW) ? 0 : 1;
      bisHorizontalButtonDown = true;
      break;
    case DOWN_ARROW:
      autoVerticalMoveTimer = verticalMoveTimeLimit;
      bisVerticalButtonDown = true;
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

function keyReleased() {
  let key = keyCode;
  switch (key) {
    case LEFT_ARROW:
      bisHorizontalButtonDown = keyIsDown(RIGHT_ARROW)
        ? bisHorizontalButtonDown
        : false;
      horizontalMoveTimer = 0;
      break;
    case RIGHT_ARROW:
      bisHorizontalButtonDown = keyIsDown(LEFT_ARROW)
        ? bisHorizontalButtonDown
        : false;
      horizontalMoveTimer = 0;
      break;
    case DOWN_ARROW:
      bisVerticalButtonDown = false;
      manualVerticalMoveTimer = 0;
      break;
    default:
      break;
  }
}

function pauseGame() {
  console.log(frameRate());
  if (!bisPaused) {
    bisPaused = true;
    setFrameRate(0);
    document.querySelector("#sideButtons_pause").innerHTML = "unPause";
  } else {
    bisPaused = false;
    setFrameRate(FRAME_RATE);
    document.querySelector("#sideButtons_pause").innerHTML = "Pause";
  }
}

function resetGame() {
  GAME_GRID.reset();
  activePiece.reset();
  score = 0;
  verticalMoveTimeLimit = 1000;
  if (bisPaused) {
    pauseGame();
  } else {
    setFrameRate(FRAME_RATE);
  }
}

function startGame() {
  document.querySelector("#startScreen").style.display = "none";
  resetGame();
}
