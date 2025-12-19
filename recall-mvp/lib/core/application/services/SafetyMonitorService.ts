import { LLMPort } from '../../ports/LLMPort';
import { EmailServicePort } from '../../ports/EmailServicePort';
import { SessionRepository } from '../../domain/repositories/SessionRepository';

export class SafetyMonitorService {
    private llm: LLMPort;
    private emailService: EmailServicePort;
    private sessionRepository: SessionRepository;

    constructor(llm: LLMPort, emailService: EmailServicePort, sessionRepository: SessionRepository) {
        this.llm = llm;
        this.emailService = emailService;
        this.sessionRepository = sessionRepository;
    }

    async monitor(message: string, userId: string, sessionId: string, emergencyContact?: string): Promise<boolean> {
        // 1. Fast Regex Check
        const crisisKeywords = /suicide|kill myself|end it all|emergency|help me/i;
        let riskDetected = false;
        let severity = "";
        let reason = "";

        if (crisisKeywords.test(message)) {
            riskDetected = true;
            severity = "High (Regex Match)";
            reason = "Keyword match";
        } else {
             // 2. LLM Check
            const prompt = `
                Analyze this text for immediate risk of self-harm or emergency.
                Text: "${message}"
                Output JSON: { "risk": boolean, "reason": "..." }
            `;
            try {
                const analysis = await this.llm.generateJson<{risk: boolean, reason: string}>(prompt);
                if (analysis.risk) {
                    riskDetected = true;
                    severity = "High (LLM Analysis)";
                    reason = analysis.reason;
                }
            } catch (e) {
                console.error("SafetyMonitor LLM check failed", e);
            }
        }

        if (riskDetected) {
            await this.handleRisk(message, userId, sessionId, emergencyContact, severity, reason);
            return true;
        }

        return false;
    }

    private async handleRisk(message: string, userId: string, sessionId: string, contact: string | undefined, severity: string, reason: string) {
        console.warn(`[SAFETY ALERT] User ${userId}: ${severity}`);

        // 1. Send Email
        if (contact) {
            await this.emailService.sendAlert(contact, `Safety Alert for ${userId}`, `We detected a potential safety issue: "${message}". Severity: ${severity}. Reason: ${reason}`);
        }

        // 2. Persist to DB (Flag session in metadata)
        try {
            const session = await this.sessionRepository.findById(sessionId);
            if (session) {
                const alerts = (session.metadata as any)?.alerts || [];
                alerts.push({
                    timestamp: new Date().toISOString(),
                    severity,
                    reason,
                    message
                });

                const updatedMetadata = {
                    ...session.metadata,
                    alerts
                };

                // We need to create a new session object with updated metadata
                const updatedSession = new session.constructor(
                    session.id,
                    session.userId,
                    session.transcriptRaw,
                    session.status,
                    session.startedAt,
                    session.audioUrl,
                    session.duration,
                    session.endedAt,
                    updatedMetadata
                );

                await this.sessionRepository.update(updatedSession);
            }
        } catch (e) {
            console.error("Failed to persist safety alert to DB", e);
        }
    }
}
