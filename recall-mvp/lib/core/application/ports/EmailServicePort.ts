export interface EmailServicePort {
  sendChapterNotification(chapterId: string, email: string): Promise<void>;
}
