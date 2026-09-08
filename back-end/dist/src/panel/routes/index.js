"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = exports.itemRoutes = exports.authRoutes = void 0;
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
exports.authRoutes = authRoutes_1.default;
const itemRoutes_1 = __importDefault(require("./itemRoutes"));
exports.itemRoutes = itemRoutes_1.default;
const messageRoutes_1 = __importDefault(require("./messageRoutes"));
exports.messageRoutes = messageRoutes_1.default;
const router = (0, express_1.Router)();
router.use('/', authRoutes_1.default);
router.use('/items', itemRoutes_1.default);
router.use('/messages', messageRoutes_1.default);
exports.default = router;
