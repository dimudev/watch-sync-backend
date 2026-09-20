import { IsNotEmpty, IsString } from 'class-validator';

export class AddVideoDto {
  @IsString()
  @IsNotEmpty()
  urlOrId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
