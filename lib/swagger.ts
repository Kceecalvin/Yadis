/**
 * Swagger/OpenAPI Documentation Configuration
 * Complete API documentation setup
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'YADDPLAST E-Commerce API',
    description: 'Complete API documentation for YADDPLAST e-commerce platform',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@yaddplast.com',
      url: 'https://yaddplast.com/support',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'https://api.yaddplast.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User authentication endpoints' },
    { name: 'Products', description: 'Product catalog endpoints' },
    { name: 'Cart', description: 'Shopping cart endpoints' },
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Payments', description: 'Payment processing endpoints' },
    { name: 'Users', description: 'User profile endpoints' },
    { name: 'Reviews', description: 'Product review endpoints' },
    { name: 'Loyalty', description: 'Loyalty program endpoints' },
    { name: 'Admin', description: 'Admin dashboard endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'name'],
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number', format: 'decimal' },
          stock: { type: 'integer' },
          category: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          rating: { type: 'number', minimum: 0, maximum: 5 },
          reviews: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'price', 'stock'],
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
              },
            },
          },
          total: { type: 'number' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
          },
          paymentMethod: { type: 'string' },
          deliveryAddress: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'userId', 'items', 'total', 'status'],
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string', enum: ['KES', 'USD', 'EUR'] },
          method: { type: 'string', enum: ['stripe', 'mpesa', 'pay_on_delivery'] },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
          },
          transactionId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'orderId', 'amount', 'status'],
      },
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['code', 'message'],
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Invalid input' },
          409: { description: 'User already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          429: { description: 'Too many login attempts' },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of products' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product details' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get shopping cart',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Shopping cart' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                },
                required: ['productId', 'quantity'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Item added to cart' },
          401: { description: 'Unauthorized' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/api/orders/create': {
      post: {
        tags: ['Orders'],
        summary: 'Create new order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: { type: 'array' },
                  deliveryAddress: { type: 'object' },
                  paymentMethod: { type: 'string' },
                },
                required: ['items', 'deliveryAddress', 'paymentMethod'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Order created successfully' },
          400: { description: 'Invalid input' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Order details' },
          401: { description: 'Unauthorized' },
          404: { description: 'Order not found' },
        },
      },
    },
    '/api/payments/stripe': {
      post: {
        tags: ['Payments'],
        summary: 'Process Stripe payment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orderId: { type: 'string' },
                  token: { type: 'string' },
                  amount: { type: 'number' },
                },
                required: ['orderId', 'token', 'amount'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Payment processed' },
          400: { description: 'Payment failed' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/payments/mpesa': {
      post: {
        tags: ['Payments'],
        summary: 'Initiate M-Pesa payment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orderId: { type: 'string' },
                  phoneNumber: { type: 'string' },
                  amount: { type: 'number' },
                },
                required: ['orderId', 'phoneNumber', 'amount'],
              },
            },
          },
        },
        responses: {
          200: { description: 'M-Pesa prompt initiated' },
          400: { description: 'Invalid phone number' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./app/api/**/*.ts'],
};
