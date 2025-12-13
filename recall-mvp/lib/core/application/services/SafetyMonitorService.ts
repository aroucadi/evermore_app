import { AlertRepository } from '../../domain/repositories/AlertRepository';
import { Alert, AlertType, AlertSeverity } from '../../domain/entities/Alert';
import { EmailServicePort } from '../../application/ports/EmailServicePort';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { randomUUID } from 'crypto';

export class SafetyMonitorService {
  constructor(
      private alertRepository: AlertRepository,
      private userRepository: UserRepository,
      private emailService: EmailServicePort
  ) {}

  private crisisKeywords = [
    'don\'t want to live', 'end it all', 'not worth living',
    'kill myself', 'better off dead', 'suicide'
  ];

  private medicalKeywords = [
    'chest pain', 'can\'t breathe', 'difficulty breathing',
    'I fell', 'fallen', 'bleeding', 'heart attack', 'stroke'
  ];

  // Cognitive decline signals are harder to regex, often context dependent.
  // We'll use simple repetition for MVP if possible, or leave for LLM analysis.
  // For MVP 1.5 spec: "Repeated questions about current date/year"
  private declineKeywords = [
    'what year is it', 'what is the date', 'what day is it',
    'who are you', 'where am i'
  ];

  async scanMessage(seniorId: string, sessionId: string | null, text: string): Promise<Alert | null> {
    const lowerText = text.toLowerCase();

    // Check Crisis
    for (const keyword of [...this.crisisKeywords, ...this.medicalKeywords]) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return await this.createAlert(seniorId, sessionId, 'crisis', 'high', keyword, text);
        }
    }

    // Check Decline
    for (const keyword of this.declineKeywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
            // In a real system we might count frequency. For MVP, alert on occurrence?
            // Spec says "Repeated questions...". Single occurrence might be noise.
            // But let's log it as 'decline' with 'low' severity.
            return await this.createAlert(seniorId, sessionId, 'decline', 'low', keyword, text);
        }
    }

    return null;
  }

  private async createAlert(
      seniorId: string,
      sessionId: string | null,
      type: AlertType,
      severity: AlertSeverity,
      triggerPhrase: string,
      fullText: string
  ): Promise<Alert> {
      const content = `Safety Alert: Detected "${triggerPhrase}" in message: "${fullText}"`;
      const alert = new Alert(
          randomUUID(),
          seniorId,
          sessionId,
          type,
          content,
          severity,
          triggerPhrase,
          false // not acknowledged
      );

      const createdAlert = await this.alertRepository.create(alert);

      // Send Notification
      const senior = await this.userRepository.findById(seniorId);
      if (senior && senior.preferences?.emergencyContact) {
          const contact = senior.preferences.emergencyContact;
          if (contact.email) {
              await this.emailService.sendAlert(
                  contact.email,
                  `URGENT: Safety Alert for ${senior.name}`,
                  `The system detected a concerning phrase: "${triggerPhrase}".\n\nFull context: "${fullText}"\n\nPlease check on them immediately.`
              );
          }
      }

      return createdAlert;
  }
}
