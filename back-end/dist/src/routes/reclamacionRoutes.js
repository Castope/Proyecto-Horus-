"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reclamacionController_1 = require("../controllers/reclamacionController");
const router = express_1.default.Router();
router.post('/', reclamacionController_1.registrarReclamo);
exports.default = router;
