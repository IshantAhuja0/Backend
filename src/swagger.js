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
      url: "https://videotube-rtub.onrender.com/api/v1",
      description: "Server",
    },
  ],
tags: [
  { name: "User", description: "User registration, profile, and auth APIs" },
  { name: "Healthcheck", description: "Health check APIs for status monitoring" },
  { name: "Video", description: "Video uploading, viewing, and management APIs" },
  { name: "Dashboard", description: "Admin or user dashboard APIs" },
  { name: "Subscription", description: "Subscribe/Unsubscribe channel APIs" },
  { name: "Like", description: "Like and dislike APIs" },
  { name: "Playlist", description: "User playlist APIs" },
  { name: "Comment", description: "Comment and reply APIs" },
  { name: "Tweet", description: "Tweet-like micro-posting APIs" }
]

};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.routes.js"], // ✅ Corrected path for your structure
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
