"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn'],
    });
    app.use((0, compression_1.default)({
        level: 4,
        threshold: 512,
    }));
    app.enableCors({
        origin: [
            'http://localhost:3002',
            'http://127.0.0.1:3002',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Backend is running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map