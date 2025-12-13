import { UserRepository } from '../../../core/domain/repositories/UserRepository';
import { User } from '../../../core/domain/entities/User';
import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export class DrizzleUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const [created] = await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      seniorId: user.seniorId,
      phoneNumber: user.phoneNumber,
      preferences: user.preferences
    }).returning();

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const [found] = await db.select().from(users).where(eq(users.id, id));
    return found ? this.mapToEntity(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [found] = await db.select().from(users).where(eq(users.email, email));
    return found ? this.mapToEntity(found) : null;
  }

  async update(user: User): Promise<User> {
    const [updated] = await db.update(users)
      .set({
        name: user.name,
        email: user.email,
        role: user.role,
        seniorId: user.seniorId,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    return this.mapToEntity(updated);
  }

  private mapToEntity(raw: any): User {
    return new User(
      raw.id,
      raw.name,
      raw.email,
      raw.role,
      raw.seniorId,
      raw.phoneNumber,
      raw.preferences,
      raw.createdAt,
      raw.updatedAt
    );
  }
}
