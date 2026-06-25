import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';
import {
  getStoreInfo,
  getProducts,
  createProduct,
  getOrders,
  getOrder,
  getRevenueStats,
  getTopProducts,
} from '../services/woocommerce.js';

const router = Router();

// GET /api/woocommerce/status — Verify connection
router.get('/status', async (req, res) => {
  try {
    const info = await getStoreInfo();
    res.json({
      success: true,
      connected: true,
      store: {
        url: process.env.WOOCOMMERCE_STORE_URL,
        version: info.environment?.wp_version,
        wooVersion: info.environment?.version,
      },
    });
  } catch (error: any) {
    logger.error('WooCommerce status error:', error);
    res.status(503).json({
      success: false,
      connected: false,
      error: 'Cannot connect to WooCommerce store. Check credentials.',
    });
  }
});

// GET /api/woocommerce/products
router.get('/products', async (req, res) => {
  try {
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 20;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
    
    const result = await getProducts({
      limit,
      page,
      status: req.query.status,
      orderby: req.query.orderby,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Get products error:', error);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// POST /api/woocommerce/products — Create product
router.post('/products',
  body('name').isString().trim().notEmpty(),
  body('price').isNumeric(),
  validateRequest,
  async (req, res) => {
    try {
      const product = await createProduct(req.body);
      res.status(201).json({ success: true, product });
    } catch (error: any) {
      logger.error('Create product error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Could not create product', details: error.response?.data });
    }
  }
);

// GET /api/woocommerce/orders
router.get('/orders', async (req, res) => {
  try {
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 20;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;

    const result = await getOrders({
      limit,
      page,
      status: req.query.status,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Get orders error:', error);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// GET /api/woocommerce/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await getOrder(parseInt(req.params.id));
    res.json({ success: true, order });
  } catch (error: any) {
    logger.error('Get order error:', error);
    res.status(500).json({ error: 'Could not fetch order' });
  }
});

// GET /api/woocommerce/stats
router.get('/stats', async (req, res) => {
  try {
    const period = typeof req.query.period === 'string' ? req.query.period : 'month';
    const [revenue, topProducts] = await Promise.all([
      getRevenueStats(period),
      getTopProducts(period),
    ]);
    res.json({ success: true, revenue, topProducts });
  } catch (error: any) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Could not fetch stats' });
  }
});

export default router;
