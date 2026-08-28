"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuthController_1 = require("../controllers/adminAuthController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminItemController_1 = require("../controllers/adminItemController");
const router = express_1.default.Router();
router.post('/register', adminAuthController_1.registerAdmin);
router.post('/login', adminAuthController_1.loginAdmin);
router.get('/me', authMiddleware_1.authMiddleware, adminAuthController_1.getCurrentAdmin);
router.get('/items', authMiddleware_1.authMiddleware, adminItemController_1.getAdminItems);
router.post('/items', authMiddleware_1.authMiddleware, adminItemController_1.createAdminItem);
router.put('/items/:id', authMiddleware_1.authMiddleware, adminItemController_1.updateAdminItem);
router.delete('/items/:id', authMiddleware_1.authMiddleware, adminItemController_1.deleteAdminItem);
exports.default = router;
