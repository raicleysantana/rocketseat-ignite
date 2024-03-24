"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCouse = void 0;
const CreateCouseService_1 = __importDefault(require("./CreateCouseService"));
function createCouse(request, response) {
    CreateCouseService_1.default.execute("NodeJs", 10, "Cley");
    return response.send();
}
exports.createCouse = createCouse;
