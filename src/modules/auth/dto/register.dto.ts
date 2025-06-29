import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ 
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ 
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password',
    example: 'SecurePass123!',
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
    example: 'SecurePass123!'
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ 
    description: 'User phone number (optional)',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
