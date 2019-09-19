const GRID_SPACING = 20; // pixel size of each square, only used when rendering
const GRID_HEIGHT = 20; // actual size of first dimension in gameGrid
const GRID_WIDTH = 12; // actual size of second dimension in gameGrid
const STARTING_Y = 0; // starting height of new tetro
const STARTING_X = Math.round(GRID_WIDTH / 2);
let clearedRows = []; // used for animation effect, no affect on gameplay
let score = 0;
let nextMoveX = 0; // buffers user input for next frame, gets cleared at end of frame
let nextRotate = 0;
let verticalMoveTimeLimit = 1000;

let nextLetter = "";

class GameGrid {
  constructor(height, width, defaultValue = { r: 177, g: 177, b: 177, a: 0 }) {
    this.grid = create2dArray(height, width, defaultValue);
    this.height = height;
    this.width = width;
    this.defaultValue = defaultValue;
  }

  reset() {
    console.log("resetting grid");
    this.grid = create2dArray(this.height, this.width, this.defaultValue);
    console.log(this.grid);
  }

  copyPieceToGrid(t) {
    for (let y = 0; y < t.shape.length; y++) {
      for (let x = 0; x < t.shape[y].length; x++) {
        if (t.shape[y][x] !== 0) {
          this.grid[t.y + y][t.x + x] = { ...t.color, a: 1 };
        }
      }
    }
  }

  checkCollision(t) {
    for (let y = 0; y < t.shape.length; y++) {
      for (let x = 0; x < t.shape[y].length; x++) {
        if (t.y + y >= this.height || t.x + x >= this.width) {
          return { col: true, wall: t.x + x >= this.width };
        }
        if (this.grid[t.y + y][t.x + x].a !== 0 && t.shape[y][x] !== 0) {
          return { col: true, wall: false };
        }
      }
    }
    return { col: false, wall: false };
  }

  checkRows() {
    let numOfmatches = 0;
    let matchedRows = [];
    for (let y = 0; y < this.height; y++) {
      let bNotFilledRow = this.grid[y].some(i => i.a <= 0);
      if (!bNotFilledRow) {
        numOfmatches++;
        matchedRows.push(y);
        clearedRows.push(y);
      }
    }
    matchedRows.forEach(r => {
      this.grid.splice(r, 1);
      this.grid.unshift(new Array(this.width).fill(0));
      verticalMoveTimeLimit = Math.max(verticalMoveTimeLimit - 60, 60);
    });
    score += numOfmatches * numOfmatches * 10;
  }
}

class Piece {
  SHAPES = {
    t: [[1, 1, 1], [0, 1, 0]],
    l: [[1, 1], [0, 1], [0, 1]],
    j: [[1, 1], [1, 0], [1, 0]],
    i: [[1], [1], [1], [1]],
    o: [[1, 1], [1, 1]],
    s: [[0, 1, 1], [1, 1, 0]],
    z: [[1, 1, 0], [0, 1, 1]]
  };
  getShapes() {
    return this.SHAPES;
  }

  constructor(grid) {
    this.grid = grid;
    this.getRandomNextLetter();
    this.reset();
  }
  reset() {
    this.rotation = 0;
    this.oldRotation = this.rotation;
    this.shapeLetter = this.nextLetter;
    this.getRandomNextLetter();
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
          this.shape = mirror2dArray(
            rotate2dArray90(this.SHAPES[this.shapeLetter]),
            "y"
          );
          break;
        case 2: // 180 rotation
          this.shape = mirror2dArray(
            mirror2dArray(this.SHAPES[this.shapeLetter], "y"),
            "x"
          );
          break;
        case 3: // 270CW rotation
          this.shape = mirror2dArray(
            rotate2dArray90(this.SHAPES[this.shapeLetter]),
            "x"
          );
          break;
        default:
          break;
      }
      let colRes = this.grid.checkCollision(this);
      if (colRes.col) {
        if (colRes.wall) {
          nextMoveX = -1;
          this.moveHorizontal();
        } else {
          nextRotate = 0;
          this.rotation = this.oldRotation;
          this.oldRotation = copyOldRotation;
          this.rotate(true);
        }
      }
    }
    nextRotate = 0;
  }
  moveVertical() {
    this.oldX = this.x;
    this.oldY = this.y;
    let newY = this.y + 1;
    this.y = Math.max(
      Math.min(newY, this.grid.height + 1 - this.shape.length),
      0
    );
    if (this.grid.checkCollision(this).col) {
      //revert position and lock piece
      this.x = this.oldX;
      this.y = this.oldY;
      this.grid.copyPieceToGrid(this);
      this.reset();
      this.grid.checkRows();
      if (this.grid.checkCollision(this).col) {
        //pieces are overlapping at spawn point, game over
        document.querySelector("#startScreen_instructions").innerHTML =
          "Game Over | Score:" + score;
        document.querySelector("#startScreen_start").innerHTML = "Play Again";
        document.querySelector("#startScreen").style.display = "block";
        frameRate(0);
      }
      return true;
    }
    return false;
  }
  moveHorizontal() {
    this.oldX = this.x;
    this.oldY = this.y;
    let newX = this.x + nextMoveX;
    this.x = Math.max(
      Math.min(newX, this.grid.width - this.shape[0].length),
      0
    );
    nextMoveX = 0;
    if (this.grid.checkCollision(this).col) {
      this.x = this.oldX;
      this.y = this.oldY;
    }
  }
  getRandomNextLetter() {
    let keys = Object.keys(this.SHAPES);
    let newLetter = keys[Math.floor(Math.random() * keys.length)];
    console.log(this.shapeLetter, newLetter);
    if (newLetter !== this.shapeLetter) {
      this.nextLetter = newLetter;
    } else {
      this.getRandomNextLetter();
    }
  }
  getColor() {
    switch (this.shapeLetter.toString()) {
      case "i":
        this.color = { r: 255, g: 100, b: 100 };
        break;
      case "j":
        this.color = { r: 240, g: 240, b: 240 };
        break;
      case "l":
        this.color = { r: 255, g: 50, b: 255 };
        break;
      case "o":
        this.color = { r: 50, g: 100, b: 255 };
        break;
      case "s":
        this.color = { r: 50, g: 255, b: 50 };
        break;
      case "t":
        this.color = { r: 255, g: 255, b: 100 };
        break;
      case "z":
        this.color = { r: 180, g: 180, b: 255 };
        break;
      default:
        this.color = { r: 177, g: 177, b: 177 };
        break;
    }
  }
}
