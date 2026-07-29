import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ListBookmarksQueryDto {
  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/)
  collectionId?: string;

  @IsOptional()
  @Transform((params: TransformFnParams): unknown => {
    const value: unknown = params.value;
    return typeof value === 'string' ? value.trim() : value;
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  q?: string;
}
