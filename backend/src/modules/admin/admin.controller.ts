import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../products/categories.service';
import { OrdersService } from '../orders/orders.service';
import { FulfillmentsService } from '../fulfillments/fulfillments.service';
import { AdminStatsService } from './admin-stats.service';
import { UsersService } from '../users/users.service';
import { PromoService } from '../promo/promo.service';
import { ReviewsService } from '../reviews/reviews.service';
import { TicketsService } from '../tickets/tickets.service';
import { ClaimsService } from '../claims/claims.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../products/dto/product.dto';
import { CreateCategoryDto, UpdateCategoryDto } from '../products/dto/category.dto';
import { OrderQueryDto } from '../orders/dto/order.dto';
import { CreatePromoDto } from '../promo/dto/promo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class AdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly ordersService: OrdersService,
    private readonly fulfillmentsService: FulfillmentsService,
    private readonly adminStatsService: AdminStatsService,
    private readonly usersService: UsersService,
    private readonly promoService: PromoService,
    private readonly reviewsService: ReviewsService,
    private readonly ticketsService: TicketsService,
    private readonly claimsService: ClaimsService,
    private readonly auditService: AuditService,
  ) {}

  // ─── DASHBOARD STATS ───────────────────────────────

  @Get('stats')
  async getDashboardStats() {
    return this.adminStatsService.getDashboardStats();
  }

  // ─── PRODUCTS ──────────────────────────────────────

  @Get('products')
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productsService.adminFindAll(query);
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.adminFindById(id);
  }

  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { message: 'Produk berhasil dihapus' };
  }

  // ─── CATEGORIES ────────────────────────────────────

  @Get('categories')
  async getCategories() {
    return this.categoriesService.findAll(true);
  }

  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { message: 'Kategori berhasil dihapus' };
  }

  // ─── ORDERS ────────────────────────────────────────

  @Get('orders')
  async getOrders(@Query() query: OrderQueryDto) {
    return this.ordersService.adminFindAll(query);
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  // ─── FULFILLMENTS ──────────────────────────────────

  @Get('fulfillments')
  async getFulfillments(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.fulfillmentsService.findAll(status, page || 1, limit || 20);
  }

  @Get('fulfillments/pending')
  async getPendingFulfillments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.fulfillmentsService.findPending(page || 1, limit || 20);
  }

  @Get('fulfillments/order/:orderId')
  async getFulfillmentByOrder(@Param('orderId') orderId: string) {
    return this.fulfillmentsService.findByOrderId(orderId);
  }

  @Post('fulfillments/:id/assign')
  async assignFulfillment(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.fulfillmentsService.assignToAdmin(id, req.user.id);
  }

  @Post('fulfillments/:id/content')
  async inputDeliveryContent(
    @Param('id') id: string,
    @Body() body: { content: Record<string, any>; notes?: string },
    @Request() req: any,
  ) {
    return this.fulfillmentsService.inputDeliveryContent(
      id, req.user.id, body.content, body.notes,
    );
  }

  @Post('fulfillments/:id/deliver')
  async sendDelivery(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.fulfillmentsService.sendDelivery(id, req.user.id);
  }

  // ─── USER MANAGEMENT ───────────────────────────────

  @Get('users')
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(page || 1, limit || 20);
  }

  @Put('users/:id/toggle')
  async toggleUserStatus(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return { message: 'User tidak ditemukan' };
    }
    user.isActive = !user.isActive;
    return this.usersService.save(user);
  }

  // ─── PROMO MANAGEMENT ─────────────────────────────

  @Get('promo')
  async getPromos() {
    return this.promoService.findAll();
  }

  @Post('promo')
  async createPromo(@Body() dto: CreatePromoDto) {
    return this.promoService.create(dto);
  }

  @Put('promo/:id')
  async updatePromo(@Param('id') id: string, @Body() dto: Partial<CreatePromoDto>) {
    return this.promoService.update(id, dto);
  }

  @Delete('promo/:id')
  async deletePromo(@Param('id') id: string) {
    await this.promoService.remove(id);
    return { message: 'Promo berhasil dihapus' };
  }

  @Put('promo/:id/toggle')
  async togglePromo(@Param('id') id: string) {
    return this.promoService.toggleActive(id);
  }

  // ─── REVIEW MANAGEMENT ─────────────────────────────

  @Get('reviews')
  async getReviews(
    @Query('approved') approved?: string,
    @Query('page') page?: number,
  ) {
    const isApproved = approved === 'true' ? true : approved === 'false' ? false : undefined;
    return this.reviewsService.findAll(isApproved, page || 1);
  }

  @Put('reviews/:id/approve')
  async approveReview(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @Put('reviews/:id/featured')
  async toggleFeaturedReview(@Param('id') id: string) {
    return this.reviewsService.toggleFeatured(id);
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string) {
    await this.reviewsService.reject(id);
    return { message: 'Review berhasil dihapus' };
  }

  // ─── TICKET MANAGEMENT ─────────────────────────────

  @Get('tickets')
  async getTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: number,
  ) {
    return this.ticketsService.findAll(status, priority, page || 1);
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Put('tickets/:id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.ticketsService.updateStatus(id, body.status);
  }

  @Put('tickets/:id/assign')
  async assignTicket(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.ticketsService.assign(id, req.user.id);
  }

  @Put('tickets/:id/priority')
  async updateTicketPriority(
    @Param('id') id: string,
    @Body() body: { priority: string },
  ) {
    return this.ticketsService.updatePriority(id, body.priority);
  }

  // ─── CLAIM MANAGEMENT ──────────────────────────────

  @Get('claims')
  async getClaims(
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return this.claimsService.findAll(status, page || 1);
  }

  @Get('claims/:id')
  async getClaim(@Param('id') id: string) {
    return this.claimsService.findById(id);
  }

  @Put('claims/:id/approve')
  async approveClaim(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @Request() req: any,
  ) {
    return this.claimsService.approve(id, req.user.id, body?.notes);
  }

  @Put('claims/:id/reject')
  async rejectClaim(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @Request() req: any,
  ) {
    return this.claimsService.reject(id, req.user.id, body?.notes);
  }

  @Put('claims/:id/complete')
  async completeClaim(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.claimsService.complete(id, req.user.id);
  }

  // ─── AUDIT LOG ───────────────────────────────────

  @Get('audit-logs')
  async getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
  ) {
    return this.auditService.findAll(
      { entityType, action, userId },
      page || 1,
    );
  }
}
