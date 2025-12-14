import { DrizzleUserRepository } from '../adapters/db/DrizzleUserRepository';
import { DrizzleSessionRepository } from '../adapters/db/DrizzleSessionRepository';
import { DrizzleChapterRepository } from '../adapters/db/DrizzleChapterRepository';
import { DrizzleJobRepository } from '../adapters/db/DrizzleJobRepository';
import { CombinedAIService } from '../adapters/ai/CombinedAIService';
import { PineconeStore } from '../adapters/vector/PineconeStore';
import { ResendEmailService } from '../adapters/email/ResendEmailService';
import { AoTChapterGeneratorAdapter } from '../adapters/ai/AoTChapterGeneratorAdapter';

import { CreateUserUseCase } from '../../core/application/use-cases/CreateUserUseCase';
import { StartSessionUseCase } from '../../core/application/use-cases/StartSessionUseCase';
import { ProcessMessageUseCase } from '../../core/application/use-cases/ProcessMessageUseCase';
import { EndSessionUseCase } from '../../core/application/use-cases/EndSessionUseCase';
import { GenerateChapterUseCase } from '../../core/application/use-cases/GenerateChapterUseCase';
import { GetChaptersUseCase } from '../../core/application/use-cases/GetChaptersUseCase';

// Singletons
export const userRepository = new DrizzleUserRepository();
export const sessionRepository = new DrizzleSessionRepository();
export const chapterRepository = new DrizzleChapterRepository();
export const jobRepository = new DrizzleJobRepository();
export const aiService = new CombinedAIService();
export const vectorStore = new PineconeStore(sessionRepository);
export const emailService = new ResendEmailService();
export const chapterGenerator = new AoTChapterGeneratorAdapter();

// Use Cases
export const createUserUseCase = new CreateUserUseCase(userRepository);
export const startSessionUseCase = new StartSessionUseCase(sessionRepository, userRepository, aiService, vectorStore);
export const processMessageUseCase = new ProcessMessageUseCase(sessionRepository, aiService, vectorStore);
export const generateChapterUseCase = new GenerateChapterUseCase(chapterRepository, sessionRepository, userRepository, aiService, emailService, chapterGenerator);
export const endSessionUseCase = new EndSessionUseCase(sessionRepository, jobRepository);
export const getChaptersUseCase = new GetChaptersUseCase(chapterRepository);
