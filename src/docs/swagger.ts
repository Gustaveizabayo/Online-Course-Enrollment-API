import swaggerJsdoc from " swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.3",
        info: { title: "Course Enrollment API", version: "1.0.0" },
        servers: [{ url: "/api" }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
            }
        },
        security: [{ bearerAuth: [] }]

    },
    apis: ["./scr/routes/*.ts"] // use JSDoc comments  in routes fro endpoints
};

export const swaggerSpec = swaggerJsdoc(options);