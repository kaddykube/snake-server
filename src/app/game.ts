/* TYPES */

enum Direction {
  LEFT = 1,
  RIGHT,
  UP,
  DOWN,
}

type Position = { x: number; y: number };

/* GLOBAL */

const MAX_X = 15;
const MAX_Y = 15;

/* CLASSES */

class Snake {
  private position: Position;
  color: string;
  private direction: Direction;
  private score: number;
  path: Position[];

  constructor(color: string, x: number, y: number) {
    this.color = color;
    this.position = { x: x, y: y };
    this.direction = Direction.RIGHT;
    this.score = 1;
    this.path = [];
    this.path.push({ x: x, y: y });
  }

  incrementScore() {
    this.score++;
  }

  getScore() {
    return this.score;
  }

  // utils

  checkForCollision(bitePosition: Position) {
    return isEqualPosition(this.position, bitePosition);
  }

  isDirectionOpposite(direction: Direction) {
    if (direction === Direction.LEFT && this.direction === Direction.RIGHT) {
      return true;
    } else if (
      direction === Direction.RIGHT &&
      this.direction === Direction.LEFT
    ) {
      return true;
    } else if (
      direction === Direction.UP &&
      this.direction === Direction.DOWN
    ) {
      return true;
    } else if (
      direction === Direction.DOWN &&
      this.direction === Direction.UP
    ) {
      return true;
    }
  }

  calcPosition(direction: Direction): { x: number; y: number } {
    let position = { x: this.position.x, y: this.position.y };

    if (direction === Direction.LEFT) {
      position.x = this.position.x - 1;
    } else if (direction === Direction.RIGHT) {
      position.x = this.position.x + 1;
    } else if (direction === Direction.UP) {
      position.y = this.position.y - 1;
    } else if (direction === Direction.DOWN) {
      position.y = this.position.y + 1;
    }
    return position;
  }

  // when active game

  setDirection(direction: Direction) {
    if (!this.isDirectionOpposite(direction)) {
      this.direction = direction;
    }
  }

  move() {
    // set new values
    this.position = this.calcPosition(this.direction);

    // add current values to path array
    let anchor: Position = {
      x: this.position.x,
      y: this.position.y,
    };

    this.path.push(anchor);
    if (this.path.length > this.score) {
      this.path.shift();
    }
  }
}

class Bite {
  color: string;
  position: { x: number; y: number };

  constructor(color: string, x: number, y: number) {
    this.position = { x: x, y: y };
    this.color = color;
  }

  set(x: number, y: number) {
    this.position = { x: x, y: y };
  }
}

class Canvas {
  private tileSize: number;
  private nrTilesX: number;
  private nrTilesY: number;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(tileSize: number, nrTilesX: number, nrTilesY: number) {
    this.tileSize = tileSize;
    this.nrTilesX = nrTilesX;
    this.nrTilesY = nrTilesY;
    this.createCanvas();
    this.drawLines();
  }

  createCanvas() {
    const canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = this.nrTilesX * this.tileSize;
    canvas.height = this.nrTilesY * this.tileSize;
    this.canvas = canvas;
    if (context) {
      this.context = context;
    }
    let game = document.getElementById("game");
    if (game) {
      game.appendChild(this.canvas);
    }
  }

  drawLines() {
    this.context.beginPath();
    for (let x = 0; x < this.canvas.width + 1; x++) {
      this.context.moveTo(this.tileSize * x, 0);
      this.context.lineTo(this.tileSize * x, this.canvas.width * this.tileSize);
    }
    for (let y = 0; y < this.canvas.width + 1; y++) {
      this.context.moveTo(0, this.tileSize * y);
      this.context.lineTo(this.canvas.width * this.tileSize, this.tileSize * y);
    }
    this.context.strokeStyle = "#ffffff";
    this.context.stroke();
  }

  drawBite(bite: Bite) {
    if (bite.position.x < this.nrTilesX && bite.position.y < this.nrTilesY) {
      this.context.fillStyle = bite.color;
      this.context.beginPath();
      this.context.roundRect(
        bite.position.x * this.tileSize,
        bite.position.y * this.tileSize,
        this.tileSize,
        this.tileSize,
        [10]
      );
      this.context.stroke();
      this.context.fill();
    }
  }

  drawSnake(snake: Snake) {
    snake.path.forEach((anchor) => {
      this.context.fillStyle = snake.color;
      this.context.fillRect(
        anchor.x * this.tileSize,
        anchor.y * this.tileSize,
        this.tileSize,
        this.tileSize
      );
    });
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.nrTilesX * this.tileSize,
      this.nrTilesY * this.tileSize
    );
    this.drawLines();
  }
}

class Game {
  private active: boolean;
  private canvas: Canvas;
  private speed: number;
  private snake: Snake;
  private bite: Bite;

  constructor(canvas: Canvas, speed?: number) {
    this.active = false;
    this.canvas = canvas;
    this.speed = speed | 1000;
    this.snake = new Snake("#00ff00", 5, 5);
    this.bite = new Bite("#4C0062", 11, 10);
  }

  setActive(status: boolean) {
    this.active = status;
  }

  setSnake(snake: Snake) {
    this.snake = snake;
  }

  setBite(bite: Bite) {
    this.bite = bite;
  }

  inputDirection(direction: Direction) {
    this.snake.setDirection(direction);
  }

  generateRandomBitePosition(deselect: Position[]) {
    let array: Position[] = [];
    for (let i = 0; i < MAX_X; i++) {
      for (let j = 0; j < MAX_Y; j++) {
        let check = deselect.find((position) =>
          isEqualPosition(position, { x: i, y: j })
        );
        if (!check) {
          array.push({ x: i, y: j });
        }
      }
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  // TODO: dynamic speed
  /*   
  setLevelInterval() {
    const intervalID = setInterval(() => {
      if (this.active) {
        if (this.snake.getScore() < 3) {
          this.snake.move();
          this.update();
        } else {
          clearInterval(intervalID);
          this.speed = this.speed / 2;
          const intervalIDID = setInterval(() => {
            if (this.active) {
              this.snake.move();
              this.update();
            } else {
              clearInterval(intervalIDID);
            }
          }, this.speed);
        }
      } else {
        clearInterval(intervalID);
      }
    }, this.speed);
  }
 */
  start() {
    if (this.snake && this.bite) {
      this.setActive(true);
      const x = Math.floor(Math.random() * MAX_X);
      const y = Math.floor(Math.random() * MAX_Y);
      this.bite.set(x, y);
    }
    this.update();

    setInterval(() => {
      if (this.active) {
        this.snake.move();
        if (this.snake.checkForCollision(this.bite.position)) {
          this.snake.incrementScore();
          const randomPosition = this.generateRandomBitePosition(
            this.snake.path
          );
          if (randomPosition) {
            this.bite.set(randomPosition.x, randomPosition.y);
          } else {
            // end of game
            this.bite.set(0, 0);
          }
        }
        this.update();
      }
    }, this.speed);
  }

  update() {
    this.canvas.clear();
    this.canvas.drawBite(this.bite);
    this.canvas.drawSnake(this.snake);
  }

  pause() {
    this.setActive(false);
  }

  play() {
    if (!this.active) {
      this.setActive(true);
    }
  }
}

/* INIT */

const run = () => {
  // init canvas and game items
  const canvas = new Canvas(20, MAX_X, MAX_Y);
  // scene
  const game = new Game(canvas, 1000);

  // control

  const startButton: HTMLButtonElement = tryGetButton("start");
  const pauseButton: HTMLButtonElement = tryGetButton("pause");
  const playButton: HTMLButtonElement = tryGetButton("play");

  if (startButton && pauseButton && playButton) {
    startButton.addEventListener("click", () => {
      startButton.disabled = true;
      game.start();
    });
    pauseButton.addEventListener("click", () => {
      game.pause();
    });
    playButton.addEventListener("click", () => {
      game.play();
    });
  }

  window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    if (!game) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        game.inputDirection(Direction.DOWN);
        break;
      case "ArrowUp":
        game.inputDirection(Direction.UP);
        break;
      case "ArrowLeft":
        game.inputDirection(Direction.LEFT);
        break;
      case "ArrowRight":
        game.inputDirection(Direction.RIGHT);
        break;
    }
  });
};

window.onload = () => {
  run();
};

/* Util */

function tryGetButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (element && element instanceof HTMLButtonElement) {
    return element;
  }
  throw Error("no button");
}

function isEqualPosition(obj1: Position, obj2: Position) {
  if (obj1.x === obj2.x && obj1.y === obj2.y) {
    return true;
  }
}
