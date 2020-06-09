import { ApiProperty } from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";

enum STATUSES {
  OK = HttpStatus.OK,
  CREATED = HttpStatus.CREATED,
  FORBIDDEN = HttpStatus.FORBIDDEN,
  FOUND = HttpStatus.FOUND,
  INTERNAL_SERVER_ERROR = HttpStatus.INTERNAL_SERVER_ERROR,
  METHOD_NOT_ALLOWED = HttpStatus.METHOD_NOT_ALLOWED,
  NOT_FOUND = HttpStatus.NOT_FOUND,
  NO_CONTENT = HttpStatus.NO_CONTENT,
  BAD_REQUEST = HttpStatus.BAD_REQUEST,
  UNAUTHORIZED = HttpStatus.UNAUTHORIZED,
}

enum METHODS {
  'GET' = 'GET',
  'POST' = 'POST',
  'PUT' = 'PUT',
  'PATCH' = 'PATCH',
  'DELETE' = 'DELETE',
}

export class ErrorDTO {
  @ApiProperty({ type: Number, enum: STATUSES })
  status: number;
  @ApiProperty({ type: Date })
  timestamp: Date;
  @ApiProperty({ type: String })
  path: string;
  @ApiProperty({ type: String, enum: METHODS })
  method: string;
  @ApiProperty({ type: String })
  message: string;
}