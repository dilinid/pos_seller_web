import type { ProductCategory } from '../types/marketplace.type';

export const MARKETPLACE_CATEGORIES: ProductCategory[] = [
  {
    id: 'supermarket',
    name: 'Supermarket',
    slug: 'supermarket',
    icon: '🛒',
    subCategories: [
      { id: 'produce', name: 'Produce', slug: 'produce', icon: '🥦' },
      { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', icon: '🥛' },
      { id: 'beverages', name: 'Beverages', slug: 'beverages', icon: '🥤' },
      { id: 'bakery', name: 'Bakery', slug: 'bakery', icon: '🍞' },
      { id: 'pantry', name: 'Pantry', slug: 'pantry', icon: '🥫' },
    ],
  },
  {
    id: 'properties',
    name: 'Properties',
    slug: 'properties',
    icon: '🏠',
    subCategories: [
      { id: 'apartments', name: 'Apartments for Rent', slug: 'apartments', icon: '🏢' },
      { id: 'houses', name: 'Houses for Sale', slug: 'houses', icon: '🏡' },
      { id: 'land', name: 'Land for Sale', slug: 'land', icon: '🌲' },
      { id: 'commercial', name: 'Commercial', slug: 'commercial', icon: '🏬' },
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    slug: 'vehicles',
    icon: '🚗',
    subCategories: [
      { id: 'cars', name: 'Cars', slug: 'cars', icon: '🚙' },
      { id: 'motorcycles', name: 'Motorcycles', slug: 'motorcycles', icon: '🏍️' },
      { id: 'bicycles', name: 'Bicycles', slug: 'bicycles', icon: '🚲' },
      { id: 'trucks', name: 'Trucks & Vans', slug: 'trucks', icon: '🚚' },
    ],
  },
];
