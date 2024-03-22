import { PartialType } from '@nestjs/swagger';
import { CreateBlogDto } from './create-blog.dto';
// automatically inferred to create-blog.dto.ts

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
