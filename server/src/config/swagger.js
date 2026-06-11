const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vivek Steel Skylines — Attendance Management API',
      version: '1.0.0',
      description: 'API Documentation for Vivek Steel Skylines Employee Attendance Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files with annotations
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
