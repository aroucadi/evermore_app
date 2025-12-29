
export interface UserProfileDTO {
    userId: string;
    role: 'senior' | 'family';
    displayName: string;
    seniorId?: string;
    currentDate?: string;
    email?: string;
    preferences: {
        conversationSchedule?: string[];
        voiceTone?: string;
        topicsLove?: string[];
        topicsAvoid?: string[];
        emergencyContact?: {
            name: string;
            phoneNumber: string;
            email?: string;
            relationship?: string;
        };
        timezone?: string;
    };
}
