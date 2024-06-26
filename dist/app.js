"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = require("path");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.use("/", express_1.default.static(__dirname + "/"));
app.use("/app", express_1.default.static(__dirname + "/app"));
app.listen(port, () => {
    console.log(`running at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map