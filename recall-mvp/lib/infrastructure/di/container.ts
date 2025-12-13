import { DrizzleUserRepository } from '../adapters/db/DrizzleUserRepository';
import { DrizzleSessionRepository } from '../adapters/db/DrizzleSessionRepository';
import { DrizzleChapterRepository } from '../adapters/db/DrizzleChapterRepository';
import { CombinedAIService } from '../adapters/ai/CombinedAIService';
import { PineconeStore } from '../adapters/vector/PineconeStore';
import { ResendEmailService } from '../adapters/email/ResendEmailService';

import { CreateUserUseCase } from '../../core/application/use-cases/CreateUserUseCase';
import { StartSessionUseCase } from '../../core/application/use-cases/StartSessionUseCase';
import { ProcessMessageUseCase } from '../../core/application/use-cases/ProcessMessageUseCase';
import { EndSessionUseCase } from '../../core/application/use-cases/EndSessionUseCase';
import { GenerateChapterUseCase } from '../../core/application/use-cases/GenerateChapterUseCase';
import { GetChaptersUseCase } from '../../core/application/use-cases/GetChaptersUseCase';

// Singletons
const userRepository = new DrizzleUserRepository();
const sessionRepository = new DrizzleSessionRepository();
const chapterRepository = new DrizzleChapterRepository();
const aiService = new CombinedAIService();
const vectorStore = new PineconeStore();
const emailService = new ResendEmailService();

// Use Cases
export const createUserUseCase = new CreateUserUseCase(userRepository);
export const startSessionUseCase = new StartSessionUseCase(sessionRepository, aiService, vectorStore);
export const processMessageUseCase = new ProcessMessageUseCase(sessionRepository, aiService, vectorStore);
export const generateChapterUseCase = new GenerateChapterUseCase(chapterRepository, sessionRepository, userRepository, aiService, emailService);
export const endSessionUseCase = new EndSessionUseCase(sessionRepository, generateChapterUseCase);
export const getChaptersUseCase = new GetChaptersUseCase(chapterRepository);
