import { Entity, Column, OneToMany, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetTokenExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires: Date | null;

  // OAuth fields
  @Column({ type: 'varchar', nullable: true })
  googleId: string;

  @Column({ type: 'varchar', nullable: true })
  githubId: string;

  @Column({ type: 'jsonb', nullable: true })
  oauthProviders: {
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
  }[] | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  lastLoginIp: string;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockUntil: Date | null;

  // Relations will be added later when Role entities are created
  // @OneToMany('UserRole', 'user')
  // userRoles: any[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isLocked(): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }

  // Methods
  incLoginAttempts(): void {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
      this.loginAttempts = 1;
      this.lockUntil = null;
    } else {
      this.loginAttempts += 1;
      // If we've reached max attempts and it's not locked already, lock it
      if (this.loginAttempts >= 5 && !this.isLocked) {
        this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockUntil = null;
  }
}
