import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Password reset token',
    example: 'abc123def456'
  })
  @IsString()
  token: string;

  @ApiProperty({ 
    description: 'New password',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: 128
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'
    }
  )
  password: string;

  @ApiProperty({ 
    description: 'Password confirmation',
    example: 'NewSecurePass123!'
  })
  @IsString()
  confirmPassword: string;
}
