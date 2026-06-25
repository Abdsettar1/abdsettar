import axios from 'axios';
import { logger } from '../utils/logger.js';

const STORE_URL = process.env.WOOCOMMERCE_STORE_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  logger.warn('WooCommerce credentials missing — store features disabled');
}

// Lazy helper to get WooCommerce API client
function getWooClient() {
  const url = process.env.WOOCOMMERCE_STORE_URL || STORE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY || CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || CONSUMER_SECRET;

  if (!url || !key || !secret) {
    throw new Error('WooCommerce configuration is incomplete. Please check WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET in environment variables.');
  }

  const cleanUrl = url.replace(/\/$/, '');
  return axios.create({
    baseURL: `${cleanUrl}/wp-json/wc/v3`,
    auth: {
      username: key,
      password: secret,
    },
    timeout: 15000,
  });
}

// Get store info
export async function getStoreInfo() {
  const url = process.env.WOOCOMMERCE_STORE_URL || STORE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY || CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || CONSUMER_SECRET;

  if (!url || !key || !secret) {
    throw new Error('WooCommerce configuration is incomplete.');
  }

  const cleanUrl = url.replace(/\/$/, '');
  const response = await axios.get(`${cleanUrl}/wp-json/wc/v3/system_status`, {
    auth: { username: key, password: secret },
  });
  return response.data;
}

// Get all products
export async function getProducts(params: any = {}) {
  const client = getWooClient();
  const response = await client.get('/products', {
    params: {
      per_page: params.limit || 20,
      page: params.page || 1,
      status: params.status || 'publish',
      orderby: params.orderby || 'date',
      order: params.order || 'desc',
      ...params,
    },
  });
  return {
    products: response.data,
    total: response.headers['x-wp-total'],
    pages: response.headers['x-wp-totalpages'],
  };
}

// Create a product
export async function createProduct(productData: any) {
  const client = getWooClient();
  const payload = {
    name: productData.name,
    type: productData.type || 'simple',
    status: productData.status || 'draft',
    description: productData.description || '',
    short_description: productData.shortDescription || '',
    regular_price: String(productData.price),
    sale_price: productData.salePrice ? String(productData.salePrice) : '',
    categories: productData.categories?.map((id: any) => ({ id })) || [],
    images: productData.images?.map((src: any) => ({ src })) || [],
    manage_stock: productData.manageStock || false,
    stock_quantity: productData.stockQuantity || null,
    sku: productData.sku || '',
  };

  const response = await client.post('/products', payload);
  return response.data;
}

// Update a product
export async function updateProduct(productId: string | number, updates: any) {
  const client = getWooClient();
  const response = await client.put(`/products/${productId}`, updates);
  return response.data;
}

// Get orders
export async function getOrders(params: any = {}) {
  const client = getWooClient();
  const response = await client.get('/orders', {
    params: {
      per_page: params.limit || 20,
      page: params.page || 1,
      status: params.status || 'any',
      ...params,
    },
  });
  return {
    orders: response.data,
    total: response.headers['x-wp-total'],
    pages: response.headers['x-wp-totalpages'],
  };
}

// Get a single order
export async function getOrder(orderId: string | number) {
  const client = getWooClient();
  const response = await client.get(`/orders/${orderId}`);
  return response.data;
}

// Get categories
export async function getCategories() {
  const client = getWooClient();
  const response = await client.get('/products/categories', {
    params: { per_page: 100 },
  });
  return response.data;
}

// Create category
export async function createCategory(name: string, description = '', parentId = 0) {
  const client = getWooClient();
  const response = await client.post('/products/categories', {
    name,
    description,
    parent: parentId,
  });
  return response.data;
}

// Get store revenue stats
export async function getRevenueStats(period = 'month') {
  const client = getWooClient();
  const response = await client.get('/reports/sales', {
    params: { period },
  });
  return response.data;
}

// Get top selling products
export async function getTopProducts(period = 'month') {
  const client = getWooClient();
  const response = await client.get('/reports/top_sellers', {
    params: { period },
  });
  return response.data;
}
