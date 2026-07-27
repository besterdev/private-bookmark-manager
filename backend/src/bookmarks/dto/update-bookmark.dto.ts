import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class UpdateBookmarkDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  url?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  notes?: string | null;

  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/)
  collectionId?: string | null;
}
