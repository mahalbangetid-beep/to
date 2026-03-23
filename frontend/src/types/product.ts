export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  type: string;
  fulfillmentType: string;
  basePrice: number;
  status: string;
  badges: string[];
  images: string[];
  rules: string;
  warrantyInfo: string;
  slaText: string;
  benefits: string[];
  howItWorks: string[];
  targetAudience: string[];
  faq: Array<{ question: string; answer: string }>;
  metaTitle: string;
  metaDesc: string;
  sortOrder: number;
  totalSold: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  variants?: ProductVariant[];
  fields?: ProductField[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  durationDays: number;
  price: number;
  originalPrice: number;
  stock: number;
  isRecommended: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductField {
  id: string;
  productId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  options: string[];
  isRequired: boolean;
  placeholder: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}
