import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { name, version } from "../package.json";
import { Express, Request, Response } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    info: {
      title: name,
      version: version,
    },
    components: {
      securitySchema: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/server.ts"],
};
const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("content-type", "application/json");
    res.send(swaggerSpec);
  });
}

export default swaggerDocs;
