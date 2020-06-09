import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDTO {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  number: number;
  @ApiProperty({
    type: String,
  })
  @IsString()
  street: string;
  @ApiProperty({
    type: String,
  })
  @IsString()
  city: string;
  @ApiProperty({
    type: String,
  })
  @IsString()
  zip: string;
  @ApiProperty({
    type: String,
  })
  @IsString()
  state: string;
  @ApiProperty({
    type: String,
  })
  @IsString()
  country: string;
}