import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DuplicateCourseDto {
  @ApiProperty({
    description: 'Title for the duplicated course',
    example: 'Cấu trúc dữ liệu - D22CNTT05',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug for the duplicated course',
    example: 'cau-truc-du-lieu-d22cntt05',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;
}
