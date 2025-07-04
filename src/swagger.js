// src/swagger.js

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My Video App API",
    version: "1.0.0",
    description: "📹 API documentation for your MERN Video Tube application. Includes user management, video upload, playlist handling, subscriptions, and more.",
  },
  servers: [
    {
      url: "https://videotube-rtub.onrender.com/api/v1",
      description: "Deployed Backend Server",
    },
    {
      url: "http://localhost:8000/api/v1",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "User", description: "User registration, login, and profile APIs" },
    { name: "Healthcheck", description: "Service health check routes" },
    { name: "Video", description: "Upload, update, and manage video content" },
    { name: "Dashboard", description: "User dashboard analytics and metrics" },
    { name: "Subscription", description: "Subscribe/Unsubscribe to channels" },
    { name: "Like", description: "Like/unlike videos, comments, and tweets" },
    { name: "Playlist", description: "Playlist creation and video management" },
    { name: "Comment", description: "Commenting and editing on videos" },
    { name: "Tweet", description: "Tweet-style micro-post APIs" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      // Optionally define reusable components for request bodies
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          statusCode: {
            type: "integer",
            example: 400,
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.routes.js"], // All routes included
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
