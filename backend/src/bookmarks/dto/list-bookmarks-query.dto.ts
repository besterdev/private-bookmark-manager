import { IsOptional, Matches } from 'class-validator';

export class ListBookmarksQueryDto {
  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/)
  collectionId?: string;
}
