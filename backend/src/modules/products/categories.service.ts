import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async findAll(includeInactive = false) {
    const qb = this.repo
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.children', 'children')
      .loadRelationCountAndMap('cat.productCount', 'cat.products')
      .where('cat.parentId IS NULL')
      .orderBy('cat.sortOrder', 'ASC')
      .addOrderBy('cat.name', 'ASC');

    if (!includeInactive) {
      qb.andWhere('cat.isActive = :active', { active: true });
    }

    const categories = await qb.getMany();
    return { categories };
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.repo.findOne({
      where: { slug },
      relations: ['children'],
    });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.repo.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug =
      dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = new Category();
    category.name = dto.name;
    category.slug = slug;
    category.icon = dto.icon || null as any;
    category.description = dto.description || null as any;
    category.parentId = dto.parentId || null as any;
    category.sortOrder = dto.sortOrder ?? 0;
    category.isActive = dto.isActive ?? true;

    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.parentId !== undefined) category.parentId = dto.parentId;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.repo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.repo.remove(category);
  }
}
