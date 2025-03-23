import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @IsArray()
  @IsOptional()
  studentIds?: string[];
}
