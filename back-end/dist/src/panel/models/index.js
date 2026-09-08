"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminItem = exports.AdminUser = void 0;
const AdminUser_1 = __importDefault(require("./AdminUser"));
exports.AdminUser = AdminUser_1.default;
const AdminItem_1 = __importDefault(require("./AdminItem"));
exports.AdminItem = AdminItem_1.default;
exports.default = { AdminUser: AdminUser_1.default, AdminItem: AdminItem_1.default };
