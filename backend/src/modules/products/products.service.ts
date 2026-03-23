import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductField } from './entities/product-field.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductField)
    private readonly fieldRepo: Repository<ProductField>,
  ) {}

  // ─── PUBLIC QUERIES ──────────────────────────────────────

  async findAll(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 50);
    const offset = (page - 1) * limit;

    const where: any = { status: 'active' };

    if (query.search) {
      // Use simple ILIKE for search
    }

    if (query.type) {
      where.type = query.type;
    }

    // Determine sort
    let order: any = { createdAt: 'DESC' };
    switch (query.sort) {
      case 'price_asc':
        order = { basePrice: 'ASC' };
        break;
      case 'price_desc':
        order = { basePrice: 'DESC' };
        break;
      case 'popular':
        order = { totalSold: 'DESC' };
        break;
      case 'newest':
      default:
        order = { createdAt: 'DESC' };
        break;
    }

    const [products, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'variants'],
      order,
      skip: offset,
      take: limit,
    });

    // Filter active variants only
    const filtered = products.map((p) => ({
      ...p,
      variants: (p.variants || []).filter((v) => v.isActive),
    }));

    return {
      products: filtered,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug, status: 'active' },
      relations: ['category', 'variants', 'fields'],
    });

    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    // Sort variants and fields
    product.variants = (product.variants || [])
      .filter((v) => v.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    product.fields = (product.fields || []).sort((a, b) => a.sortOrder - b.sortOrder);

    return product;
  }

  async findFeatured(limit = 8): Promise<Product[]> {
    return this.productRepo.find({
      where: { status: 'active', isFeatured: true },
      relations: ['category', 'variants'],
      order: { totalSold: 'DESC', sortOrder: 'ASC' },
      take: limit,
    });
  }

  // ─── ADMIN QUERIES ───────────────────────────────────────

  async adminFindAll(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [products, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'variants'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminFindById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'variants', 'fields'],
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  // ─── CRUD ────────────────────────────────────────────────

  async create(dto: CreateProductDto): Promise<Product> {
    const slug =
      dto.slug ||
      dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') +
        '-' + Date.now().toString(36);

    const product = new Product();
    this.applyProductData(product, dto);
    product.slug = slug;

    const savedProduct = await this.productRepo.save(product);

    // Create variants
    if (dto.variants?.length) {
      const variants = dto.variants.map((v, i) => {
        const variant = new ProductVariant();
        variant.productId = savedProduct.id;
        variant.name = v.name;
        variant.durationDays = v.durationDays ?? null as any;
        variant.price = v.price;
        variant.originalPrice = v.originalPrice ?? null as any;
        variant.stock = v.stock ?? -1;
        variant.isRecommended = v.isRecommended ?? false;
        variant.sortOrder = v.sortOrder ?? i;
        return variant;
      });
      await this.variantRepo.save(variants);
    }

    // Create fields
    if (dto.fields?.length) {
      const fields = dto.fields.map((f, i) => {
        const field = new ProductField();
        field.productId = savedProduct.id;
        field.fieldName = f.fieldName;
        field.fieldLabel = f.fieldLabel;
        field.fieldType = f.fieldType;
        field.options = f.options ?? null as any;
        field.isRequired = f.isRequired ?? true;
        field.placeholder = f.placeholder ?? null as any;
        field.sortOrder = f.sortOrder ?? i;
        return field;
      });
      await this.fieldRepo.save(fields);
    }

    return this.adminFindById(savedProduct.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.adminFindById(id);
    this.applyProductData(product, dto);

    if (dto.slug !== undefined) product.slug = dto.slug;

    await this.productRepo.save(product);

    // Replace variants if provided
    if (dto.variants !== undefined) {
      await this.variantRepo.delete({ productId: id });
      if (dto.variants.length) {
        const variants = dto.variants.map((v, i) => {
          const variant = new ProductVariant();
          variant.productId = id;
          variant.name = v.name;
          variant.durationDays = v.durationDays ?? null as any;
          variant.price = v.price;
          variant.originalPrice = v.originalPrice ?? null as any;
          variant.stock = v.stock ?? -1;
          variant.isRecommended = v.isRecommended ?? false;
          variant.sortOrder = v.sortOrder ?? i;
          return variant;
        });
        await this.variantRepo.save(variants);
      }
    }

    // Replace fields if provided
    if (dto.fields !== undefined) {
      await this.fieldRepo.delete({ productId: id });
      if (dto.fields.length) {
        const fields = dto.fields.map((f, i) => {
          const field = new ProductField();
          field.productId = id;
          field.fieldName = f.fieldName;
          field.fieldLabel = f.fieldLabel;
          field.fieldType = f.fieldType;
          field.options = f.options ?? null as any;
          field.isRequired = f.isRequired ?? true;
          field.placeholder = f.placeholder ?? null as any;
          field.sortOrder = f.sortOrder ?? i;
          return field;
        });
        await this.fieldRepo.save(fields);
      }
    }

    return this.adminFindById(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.adminFindById(id);
    await this.productRepo.remove(product);
  }

  // ─── HELPERS ─────────────────────────────────────────────

  private applyProductData(product: Product, dto: Partial<CreateProductDto>) {
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.shortDesc !== undefined) product.shortDesc = dto.shortDesc;
    if (dto.type !== undefined) product.type = dto.type;
    if (dto.fulfillmentType !== undefined) product.fulfillmentType = dto.fulfillmentType;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.badges !== undefined) product.badges = dto.badges;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.rules !== undefined) product.rules = dto.rules;
    if (dto.warrantyInfo !== undefined) product.warrantyInfo = dto.warrantyInfo;
    if (dto.slaText !== undefined) product.slaText = dto.slaText;
    if (dto.benefits !== undefined) product.benefits = dto.benefits;
    if (dto.howItWorks !== undefined) product.howItWorks = dto.howItWorks;
    if (dto.targetAudience !== undefined) product.targetAudience = dto.targetAudience;
    if (dto.faq !== undefined) product.faq = dto.faq;
    if (dto.metaTitle !== undefined) product.metaTitle = dto.metaTitle;
    if (dto.metaDesc !== undefined) product.metaDesc = dto.metaDesc;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.sortOrder !== undefined) product.sortOrder = dto.sortOrder;
  }
}
