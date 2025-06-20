// src/swagger.js

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My Video App API",
    version: "1.0.0",
    description: "API documentation for your Node.js backend",
  },
  servers: [
    {
      url: "http://localhost:8000/api/v1",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.routes.js"], // ✅ Corrected path for your structure
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
