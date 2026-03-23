import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductField } from './entities/product-field.entity';
import { Category } from './entities/category.entity';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories.service';
import { ProductsController, CategoriesController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductField, Category]),
  ],
  controllers: [ProductsController, CategoriesController],
  providers: [ProductsService, CategoriesService],
  exports: [ProductsService, CategoriesService],
})
export class ProductsModule {}
