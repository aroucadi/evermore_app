import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SafetyMonitorService } from '@/lib/core/application/services/SafetyMonitorService';
import { AlertRepository } from '@/lib/core/domain/repositories/AlertRepository';
import { UserRepository } from '@/lib/core/domain/repositories/UserRepository';
import { EmailServicePort } from '@/lib/core/application/ports/EmailServicePort';
import { User } from '@/lib/core/domain/entities/User';
import { Alert } from '@/lib/core/domain/entities/Alert';

describe('SafetyMonitorService', () => {
    let service: SafetyMonitorService;
    let mockAlertRepo: AlertRepository;
    let mockUserRepo: UserRepository;
    let mockEmailService: EmailServicePort;

    beforeEach(() => {
        mockAlertRepo = {
            create: vi.fn(async (alert) => alert),
            findById: vi.fn(),
            findByUserId: vi.fn(),
            markAsAcknowledged: vi.fn(),
        };

        mockUserRepo = {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findBySeniorId: vi.fn(),
        };

        mockEmailService = {
            sendAlert: vi.fn(),
            sendChapterNotification: vi.fn(),
        };

        service = new SafetyMonitorService(mockAlertRepo, mockUserRepo, mockEmailService);
    });

    it('should detect crisis keywords and create a high severity alert', async () => {
        const seniorId = 'senior-1';
        const text = "I just don't want to live anymore.";
        const mockUser = new User(seniorId, 'Senior', 's@test.com', 'senior', undefined, undefined, {
            emergencyContact: { name: 'Fam', email: 'fam@test.com', phone: '123' }
        });

        vi.spyOn(mockUserRepo, 'findById').mockResolvedValue(mockUser);

        const alert = await service.scanMessage(seniorId, 'session-1', text);

        expect(alert).not.toBeNull();
        expect(alert?.type).toBe('crisis');
        expect(alert?.severity).toBe('high');
        expect(mockAlertRepo.create).toHaveBeenCalled();
        expect(mockEmailService.sendAlert).toHaveBeenCalledWith(
            'fam@test.com',
            expect.stringContaining('Safety Alert'),
            expect.stringContaining('don\'t want to live')
        );
    });

    it('should detect medical keywords and create a high severity alert', async () => {
        const text = "I think I'm having a heart attack";
        const alert = await service.scanMessage('senior-1', 'session-1', text);

        expect(alert?.triggerPhrase).toBe('heart attack');
        expect(alert?.severity).toBe('high');
    });

    it('should detect decline keywords and create a low severity alert', async () => {
        const text = "Wait, what year is it again?";
        const alert = await service.scanMessage('senior-1', 'session-1', text);

        expect(alert?.type).toBe('decline');
        expect(alert?.severity).toBe('low');
    });

    it('should return null for safe text', async () => {
        const text = "I had a lovely day at the park.";
        const alert = await service.scanMessage('senior-1', 'session-1', text);
        expect(alert).toBeNull();
        expect(mockAlertRepo.create).not.toHaveBeenCalled();
    });
});
