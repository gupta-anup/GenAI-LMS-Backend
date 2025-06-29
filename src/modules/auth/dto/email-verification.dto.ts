import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ 
    description: 'Email verification token',
    example: 'abc123def456'
  })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Current password',
    example: 'OldPassword123!'
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({ 
    description: 'New password',
    example: 'NewSecurePass123!'
  })
  @IsString()
  newPassword: string;

  @ApiProperty({ 
    description: 'Password confirmation',
    example: 'NewSecurePass123!'
  })
  @IsString()
  confirmPassword: string;
}
