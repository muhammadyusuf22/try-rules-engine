import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class UserDto {
  @IsString()
  type: string;

  @IsNumber()
  age: number;

  @IsBoolean()
  isFirstTimeBuyer: boolean;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsOptional()
  verificationLevel?: number;

  @IsString()
  @IsOptional()
  id?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class OrderDto {
  @IsNumber()
  amount: number;

  @IsEnum(['electronics', 'healthcare', 'clothing', 'books', 'food'])
  category: string;

  @IsOptional()
  items?: any[];
}

export class CalculateDiscountDto {
  user: UserDto;
  order: OrderDto;
}

export class TransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  country: string;

  @IsString()
  deviceId: string;

  @IsBoolean()
  isNewDevice: boolean;
}

export class FraudCheckDto {
  user: UserDto;
  transaction: TransactionDto;
}
