import { Direction, Snake } from "./snake";

class Bite {
  position: { x: number; y: number };
  color: string;

  constructor(color: string, x: number, y: number) {
    this.position = { x: x, y: y };
    this.color = color;
  }

  set(x: number, y: number) {
    this.position = { x: x, y: y };
  }
}

class Canvas {
  tileSize: number;
  nrTilesX: number;
  nrTilesY: number;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(tileSize: number, nrTilesX: number, nrTilesY: number) {
    this.tileSize = tileSize;
    this.nrTilesX = nrTilesX;
    this.nrTilesY = nrTilesY;
    this.createCanvas();
    this.drawLines();
  }

  createCanvas() {
    const canvas = <HTMLCanvasElement>document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = this.nrTilesX * this.tileSize;
    canvas.height = this.nrTilesY * this.tileSize;
    this.canvas = canvas;
    this.context = context;
    let game = document.getElementById("game");
    game.appendChild(this.canvas);
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

/* init game */

const MAX_X = 20;
const MAX_Y = 20;

const run = () => {
  const canvas = new Canvas(20, MAX_X + 1, MAX_Y + 1);
  let bite = new Bite("#4C0062", 11, 10);
  let snake = new Snake("#00ff00", 5, 5);

  if (canvas) {
    canvas.drawBite(bite);
    canvas.drawSnake(snake);
  }

  function update() {
    canvas.clear();

    bite.set(
      Math.floor(Math.random() * MAX_X),
      Math.floor(Math.random() * MAX_Y)
    );
    canvas.drawBite(bite);
    canvas.drawSnake(snake);
  }

  window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case "ArrowDown":
        if (snake) {
          snake.set(Direction.DOWN);
          update();
        }
        break;
      case "ArrowUp":
        if (snake) {
          snake.set(Direction.UP);
          update();
        }
        break;
      case "ArrowLeft":
        if (snake) {
          snake.set(Direction.LEFT);
          update();
        }
        break;
      case "ArrowRight":
        if (snake) {
          snake.set(Direction.RIGHT);
          update();
        }
        break;
      case " ":
        update();
        break;
      default:
        return;
    }
  });
};

window.onload = () => {
  run();
};
