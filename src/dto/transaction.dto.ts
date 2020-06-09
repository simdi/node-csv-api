import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDTO {
  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  price: number;
  @ApiProperty({
    type: String,
  })
  @IsString()
  owner: string;
}