import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../database/entities/user.entity';
import { EmailService } from '../../shared/email/email.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { 
  RegisterDto, 
  LoginDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ChangePasswordDto 
} from './dto';
import { AuthResponse, JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { firstName, lastName, email, password, confirmPassword, phone } = registerDto;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      emailVerificationToken,
      emailVerificationTokenExpires,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, firstName, emailVerificationToken);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error.stack, 'AuthService');
    }

    this.logger.logSecurity('User Registration', { email, firstName, lastName });

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts');
    }

    // Reset login attempts on successful login
    user.resetLoginAttempts();
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);
    
    this.logger.logSecurity('User Login Success', { email, userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [], // TODO: Implement roles
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user || !user.password) {
      return null;
    }

    if (user.isLocked) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      user.incLoginAttempts();
      await this.userRepository.save(user);
      this.logger.logSecurity('Failed Login Attempt', { email }, 'warn');
      return null;
    }

    return user;
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async validateOAuthUser(oauthData: {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<User> {
    const { provider, providerId, email, firstName, lastName, avatar, accessToken, refreshToken } = oauthData;

    // Check if user exists by provider ID
    let user = await this.userRepository.findOne({
      where: provider === 'google' ? { googleId: providerId } : { githubId: providerId },
    });

    if (!user) {
      // Check if user exists by email
      user = await this.userRepository.findOne({ where: { email } });
      
      if (user) {
        // Link OAuth account to existing user
        if (provider === 'google') {
          user.googleId = providerId;
        } else if (provider === 'github') {
          user.githubId = providerId;
        }
        
        // Update OAuth providers array
        if (!user.oauthProviders) {
          user.oauthProviders = [];
        }
        
        const existingProvider = user.oauthProviders.find(p => p.provider === provider);
        if (!existingProvider) {
          user.oauthProviders.push({
            provider,
            providerId,
            accessToken,
            refreshToken,
          });
        }
      } else {
        // Create new user
        user = this.userRepository.create({
          firstName,
          lastName,
          email,
          avatar,
          isEmailVerified: true, // OAuth emails are considered verified
          isActive: true,
          ...(provider === 'google' ? { googleId: providerId } : { githubId: providerId }),
          oauthProviders: [{
            provider,
            providerId,
            accessToken,
            refreshToken,
          }],
        });

        await this.userRepository.save(user);
        
        // Send welcome email for new OAuth users
        try {
          await this.emailService.sendWelcomeEmail(email, firstName);
        } catch (error) {
          this.logger.error(`Failed to send welcome email to ${email}`, error.stack, 'AuthService');
        }
      }

      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      this.logger.logSecurity('OAuth User Login', { email, provider, userId: user.id });
    }

    return user;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { 
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await this.userRepository.save(user);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);

    this.logger.logSecurity('Email Verified', { email: user.email, userId: user.id });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    const { email } = resendVerificationDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await this.userRepository.save(user);

    await this.emailService.sendVerificationEmail(email, user.firstName, emailVerificationToken);

    return { message: 'Verification email sent' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate password reset token
    const passwordResetToken = uuidv4();
    const passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(email, user.firstName, passwordResetToken);

    this.logger.logSecurity('Password Reset Requested', { email, userId: user.id });

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (user.passwordResetTokenExpires && user.passwordResetTokenExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(password);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    user.refreshToken = null; // Invalidate all refresh tokens
    await this.userRepository.save(user);

    await this.emailService.sendPasswordChangeNotification(user.email, user.firstName);

    this.logger.logSecurity('Password Reset Success', { email: user.email, userId: user.id });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Cannot change password for OAuth-only accounts');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.refreshToken = null; // Invalidate all refresh tokens
    await this.userRepository.save(user);

    await this.emailService.sendPasswordChangeNotification(user.email, user.firstName);

    this.logger.logSecurity('Password Changed', { email: user.email, userId: user.id });

    return { message: 'Password changed successfully' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email } as JwtPayload,
        {
          secret: this.configService.get<string>('auth.jwtSecret'),
          expiresIn: this.configService.get<string>('auth.jwtExpiresIn'),
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtSecret'),
      expiresIn: this.configService.get<string>('auth.jwtExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      expiresIn: this.configService.get<string>('auth.jwtRefreshExpiresIn'),
    });

    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>('auth.bcryptRounds') || 12;
    return bcrypt.hash(password, rounds);
  }
}
