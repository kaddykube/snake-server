export var Direction;
(function (Direction) {
    Direction[Direction["LEFT"] = 0] = "LEFT";
    Direction[Direction["RIGHT"] = 1] = "RIGHT";
    Direction[Direction["UP"] = 2] = "UP";
    Direction[Direction["DOWN"] = 3] = "DOWN";
})(Direction || (Direction = {}));
export class Snake {
    color;
    position;
    direction;
    score;
    path;
    constructor(color, x, y) {
        this.color = color;
        this.position = { x: x, y: y };
        this.direction = Direction.RIGHT;
        this.score = 10;
        this.path = [];
        this.path.push({ x: x, y: y, direction: this.direction });
    }
    calcPosition(direction) {
        let position = { x: this.position.x, y: this.position.y };
        if (direction === Direction.LEFT) {
            position.x = this.position.x - 1;
        }
        else if (direction === Direction.RIGHT) {
            position.x = this.position.x + 1;
        }
        else if (direction === Direction.UP) {
            position.y = this.position.y - 1;
        }
        else if (direction === Direction.DOWN) {
            position.y = this.position.y + 1;
        }
        return position;
    }
    set(direction) {
        if (direction) {
            // add current values to path array
            let anchor = {
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
//# sourceMappingURL=snake.js.map