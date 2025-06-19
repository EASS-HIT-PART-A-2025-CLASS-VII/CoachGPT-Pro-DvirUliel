"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChatRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const chatRequestSchema = joi_1.default.object({
    userId: joi_1.default.string().uuid().required(),
    message: joi_1.default.string().min(1).max(2000).required(),
});
const validateChatRequest = (req, res, next) => {
    const { error, value } = chatRequestSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: error.details.map(detail => detail.message)
        });
        return;
    }
    req.body = value;
    next();
};
exports.validateChatRequest = validateChatRequest;
//# sourceMappingURL=chat.middleware.js.map