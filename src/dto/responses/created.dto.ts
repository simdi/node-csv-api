import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class CreatedDTO {
  @ApiProperty({ type: String })
  @IsMongoId()
  id: string;
};

export class LoginResponseDTO {
  @ApiProperty({ type: String })
  access_token: string;
}