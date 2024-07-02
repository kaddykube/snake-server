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
const MIN_SPEED = 650;
const GRID_COLOR = "#ffffff";
const BITE_COLOR = "#4C0062";
const SNAKE_COLOR = "#00ff00";

/* CLASSES */

class Snake {
  private _direction: Direction;
  private _score: number;
  public path: Position[];

  constructor(position: Position) {
    this._direction = Direction.RIGHT;
    this._score = 1;
    this.path = [];
    this.path.push(position);
  }

  incrementScore() {
    this._score++;
  }

  public get score() {
    return this._score;
  }

  public get direction() {
    return this._direction;
  }

  public set direction(direction: Direction) {
    if (this.isDirectionOpposite(direction)) {
      throw new Error("Direction is invalid");
    }
    this._direction = direction;
  }

  // utils

  crossBorder() {
    if (
      this.path[this.path.length - 1].x < 0 ||
      this.path[this.path.length - 1].y < 0 ||
      this.path[this.path.length - 1].x >= MAX_X ||
      this.path[this.path.length - 1].y >= MAX_Y
    ) {
      return true;
    }
  }

  biteTail() {
    // new position is set before biteTail is called
    // check for duplication in this.path
    if (this.path.length > 1) {
      if (
        this.path.filter((position) => {
          return isEqualPosition(position, this.path[this.path.length - 1]);
        }).length > 1
      ) {
        return true;
      }
    }
  }

  checkForCollision(bitePosition: Position) {
    return isEqualPosition(this.path[this.path.length - 1], bitePosition);
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

  calcPosition(direction: Direction): Position {
    let position = {
      x: this.path[this.path.length - 1].x,
      y: this.path[this.path.length - 1].y,
    };
    switch (direction) {
      case Direction.LEFT:
        position.x = this.path[this.path.length - 1].x - 1;
        break;
      case Direction.RIGHT:
        position.x = this.path[this.path.length - 1].x + 1;
        break;
      case Direction.UP:
        position.y = this.path[this.path.length - 1].y - 1;
        break;
      case Direction.DOWN:
        position.y = this.path[this.path.length - 1].y + 1;
        break;
    }
    return position;
  }

  move() {
    // set new position and add to path
    let position = this.calcPosition(this.direction);
    this.path.push(position);
    if (this.path.length > this.score) {
      this.path.shift();
    }
  }
}

class Bite {
  private _position: Position;

  constructor(position: Position) {
    this._position = position;
  }

  public set position(position: Position) {
    this._position = position;
  }

  public get position() {
    return this._position;
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
      let game = document.getElementById("game");
      if (game) {
        game.appendChild(this.canvas);
      }
    } else {
      throw new Error("no context");
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
    this.context.strokeStyle = GRID_COLOR;
    this.context.stroke();
  }

  drawBite(bite: Bite) {
    if (bite.position.x < this.nrTilesX && bite.position.y < this.nrTilesY) {
      this.context.fillStyle = BITE_COLOR;
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
      this.context.fillStyle = SNAKE_COLOR;
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
  private _active: boolean;
  private canvas: Canvas;
  private _speed: number;
  private _snake: Snake;
  private _bite: Bite;
  private complete: Event = new Event("complete");

  constructor(canvas: Canvas, speed: number = 700) {
    super();
    this._active = false;
    this.canvas = canvas;
    this._speed = speed;
    const positionSnake = {
      x: Math.floor((Math.random() * MAX_X) / 2),
      y: Math.floor((Math.random() * MAX_Y) / 2),
    };
    this.snake = new Snake(positionSnake);
    const positionBite = {
      x: Math.floor(Math.random() * MAX_X),
      y: Math.floor(Math.random() * MAX_Y),
    };
    this.bite = new Bite(positionBite);
  }

  public set speed(speed: number) {
    this._speed = speed;
  }

  public get speed(): number {
    return this._speed;
  }

  public set active(status: boolean) {
    this._active = status;
  }

  public get active(): boolean {
    return this._active;
  }

  public set snake(snake: Snake) {
    this._snake = snake;
  }

  public get snake() {
    return this._snake;
  }

  public set bite(bite: Bite) {
    this._bite = bite;
  }

  public get bite() {
    return this._bite;
  }

  inputDirection(direction: Direction) {
    this.snake.direction = direction;
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
      this.active = true;
      const positionBite = {
        x: Math.floor(Math.random() * MAX_X),
        y: Math.floor(Math.random() * MAX_Y),
      };
      this.bite.position = positionBite;
    }
    this.gameLoop(this.speed, this.snake.score);
  }

  speedUp(timeStamp: number, tempSnakeScore: number) {
    // speed dependents on snake score
    let speed = timeStamp;
    if (speed > 150) {
      if (tempSnakeScore < this.snake.score && timeStamp > 50) {
        speed = Math.floor(timeStamp - 20);
      }
    }
    this.gameLoop(speed, this.snake.score);
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
          this.dispatchEvent(this.complete);
          clearTimeout(timeoutID);
          return;
        } else {
          if (this.snake.checkForCollision(this.bite.position)) {
            this.snake.incrementScore();
            const randomPosition = this.generateRandomBitePosition(
              this.snake.path
            );
            if (randomPosition) {
              this.bite.position = randomPosition;
              this.speedUp(timeStamp, tempSnakeScore);
            } else {
              // draw message
              this.end();
              // stop loop
              this.active = !this.active;
              this.dispatchEvent(this.complete);
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
    this.active = false;
  }

  play() {
    if (!this.active) {
      this.active = true;
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
    startButton.addEventListener("click", () => {
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
