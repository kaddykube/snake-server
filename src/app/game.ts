/* TYPES */

enum Direction {
  LEFT = 1,
  RIGHT,
  UP,
  DOWN,
}

type Position = { x: number; y: number };

/* GLOBAL */

const MAX_X = 10;
const MAX_Y = 10;
const MIN_SPEED = 750;

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

  crossBorder() {
    if (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x >= MAX_X ||
      this.position.y >= MAX_Y
    ) {
      return true;
    }
  }

  biteTail() {
    // new position is set before biteTail is called
    // check for duplication in this.path
    if (this.getScore() > 1) {
      if (
        this.path.filter((position) => {
          return isEqualPosition(position, this.position);
        }).length > 1
      ) {
        return true;
      }
    }
  }

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

  setDirection(direction: Direction) {
    if (!this.isDirectionOpposite(direction)) {
      this.direction = direction;
    }
  }

  move() {
    // set new position and add to path
    this.position = this.calcPosition(this.direction);

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

  drawMessage(text: string) {
    this.context.clearRect(
      0,
      0,
      this.nrTilesX * this.tileSize,
      this.nrTilesY * this.tileSize
    );
    this.context.beginPath();
    this.context.font = "bold italic 30px Arial";
    this.context.fillStyle = "#ff4000";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(
      text,
      Math.floor((this.nrTilesX * this.tileSize) / 2),
      Math.floor((this.nrTilesY * this.tileSize) / 2)
    );
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

class Game extends EventTarget {
  private active: boolean;
  private canvas: Canvas;
  private speed: number;
  private snake: Snake;
  private bite: Bite;
  private _complete: Event = new Event("complete");

  constructor(canvas: Canvas, speed: number = 700) {
    super();
    this.active = false;
    this.canvas = canvas;
    this.speed = speed;
    this.snake = new Snake(
      "#00ff00",
      Math.floor(Math.random() * MAX_X),
      Math.floor(Math.random() * MAX_Y)
    );
    this.bite = new Bite(
      "#4C0062",
      Math.floor(Math.random() * MAX_X),
      Math.floor(Math.random() * MAX_Y)
    );
  }

  setActive(status: boolean) {
    this.active = status;
  }

  getActive(): boolean {
    return this.active;
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

  start() {
    if (this.snake && this.bite) {
      this.setActive(true);
      const x = Math.floor(Math.random() * MAX_X);
      const y = Math.floor(Math.random() * MAX_Y);
      this.bite.set(x, y);
    }
    this.gameLoop(this.speed, this.snake.getScore());
  }

  speedUp(timeStamp: number, tempSnakeScore: number) {
    // speed dependents on snake score
    let speed = timeStamp;
    if (speed > 150) {
      if (tempSnakeScore < this.snake.getScore() && timeStamp > 50) {
        speed = Math.floor(timeStamp - 20);
      }
    }
    this.gameLoop(speed, this.snake.getScore());
  }

  gameLoop(timeStamp: number, tempSnakeScore: number) {
    const timeoutID = setTimeout(() => {
      if (this.active) {
        this.snake.move();
        if (this.snake.crossBorder() || this.snake.biteTail()) {
          // draw message
          this.gameOver();
          // stop loop
          this.active = !this.active;
          this.dispatchEvent(this._complete);
          clearTimeout(timeoutID);
          return;
        } else {
          if (this.snake.checkForCollision(this.bite.position)) {
            this.snake.incrementScore();
            const randomPosition = this.generateRandomBitePosition(
              this.snake.path
            );
            if (randomPosition) {
              this.bite.set(randomPosition.x, randomPosition.y);
              this.speedUp(timeStamp, tempSnakeScore);
            } else {
              // draw message
              this.end();
              // stop loop
              this.active = !this.active;
              this.dispatchEvent(this._complete);
              clearTimeout(timeoutID);
              return;
            }
          } else {
            this.update();
            this.speedUp(timeStamp, tempSnakeScore);
          }
        }
      } else {
        this.speedUp(timeStamp, tempSnakeScore);
      }
    }, timeStamp);
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

  end() {
    this.canvas.drawMessage("you win");
  }

  gameOver() {
    this.canvas.drawMessage("game over");
  }
}

/* INIT */
const run = () => {
  // init canvas and game items
  const canvas = new Canvas(20, MAX_X, MAX_Y);
  // scene
  let game = new Game(canvas, MIN_SPEED);

  // control
  const startButton: HTMLButtonElement = tryGetButton("start");
  const pauseButton: HTMLButtonElement = tryGetButton("pause");
  const playButton: HTMLButtonElement = tryGetButton("play");

  if (startButton && pauseButton && playButton) {
    startButton.addEventListener("click", async () => {
      startButton.disabled = true;
      startButton.innerText = "running";
      game.start();
      const completeHandler = () => {
        startButton.disabled = false;
        startButton.innerText = "restart";
        game = new Game(canvas, MIN_SPEED);
      };
      game.addEventListener("complete", completeHandler);
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
      return; // do nothing if the event was already processed
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
