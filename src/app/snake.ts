export enum Direction {
  DEFAULT,
  LEFT,
  RIGHT,
  UP,
  DOWN,
}

type Anchor = { x: number; y: number; direction: Direction };

export class Snake {
  color: string;
  position: { x: number; y: number };
  direction: Direction;
  score: number;
  path: Anchor[];

  constructor(color: string, x: number, y: number) {
    this.color = color;
    this.position = { x: x, y: y };
    this.direction = Direction.RIGHT;
    this.score = 10;
    this.path = [];
    this.path.push({ x: x, y: y, direction: this.direction });
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

  set(direction: Direction) {
    if (direction) {
      // add current values to path array
      let anchor: Anchor = {
        x: this.position.x,
        y: this.position.y,
        direction: this.direction,
      };
      this.path.push(anchor);

      if (this.path.length > this.score) {
        this.path.shift();
      }
      // set new values
      this.position = this.calcPosition(direction);
      this.direction = direction;
    }
  }
}
