import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsNotEmptyObject,
  IsString,
  IsUrl,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
export class SocialLinksDTO {
  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  telegram: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  linkedIn: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  medium: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  twitter: string;
}

export class ProjectArticleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty()
  @IsOptional()
  mediaUrl: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => SocialLinksDTO)
  socialLinks: SocialLinksDTO;
}

export class UpdateProjectArticleDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  summary: string;

  @ApiProperty()
  @IsOptional()
  mediaUrl: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SocialLinksDTO)
  socialLinks: SocialLinksDTO;
}
