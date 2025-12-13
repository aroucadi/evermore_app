export type UserRole = 'senior' | 'family';

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public role: UserRole,
    public seniorId?: string,
    public phoneNumber?: string,
    public preferences?: {
      conversationSchedule?: string[];
      voiceTone?: string;
    },
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
