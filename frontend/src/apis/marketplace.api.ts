import { api } from '../shared/axios';
import type { Product, ProductSubCategory } from '../types/marketplace.type';

export interface MarketplaceProductRaw {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  categoryId: string;
  subCategoryId: string;
  sellerId: string;
  unit: string;
  image: string | null;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications: Record<string, string>;
  weight: number | null;
  volume: number | null;
  code: string;
  barcode: string;
  stock: number;
  cost: number;
}

function mapRawToProduct(raw: MarketplaceProductRaw): Product {
  return {
    id: raw.id,
    name: raw.name,
    price: raw.price,
    mrp: raw.mrp ?? undefined,
    categoryId: raw.categoryId,
    subCategoryId: raw.subCategoryId,
    sellerId: raw.sellerId,
    unit: raw.unit,
    image: raw.image ?? '',
    images: raw.images,
    description: raw.description,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    features: raw.features,
    specifications: raw.specifications,
    weight: raw.weight,
    volume: raw.volume,
    quantity: raw.stock,
    reorderLevel: null,
  };
}

export async function fetchMarketplaceProducts(): Promise<Product[]> {
  const response = await api.get<MarketplaceProductRaw[]>('/api/marketplace/products');
  return response.data.map(mapRawToProduct);
}

export async function fetchMarketplaceCategories(): Promise<ProductSubCategory[]> {
  const response = await api.get<ProductSubCategory[]>('/api/marketplace/categories');
  return response.data;
}