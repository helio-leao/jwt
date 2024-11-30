import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import users from "./mocks/users";
import accounts from "./mocks/accounts";
import swaggerDocs from "../utils/swagger";

const app = express();
app.use(express.json());

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
const TOKEN_EXPIRATION_TIME = "10m";

let refreshTokens: string[] = [];

/**
 * @openapi
 * /accounts:
 *  get:
 *    tags: [Accounts]
 *    summary: The accounts of the logged user
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Account'
 *      401:
 *        description: unauthorized
 */
app.get("/accounts", authToken, (req, res) => {
  res.json(accounts.filter((account) => account.user === req.user.id));
});

/**
 * @openapi
 * /allAccounts:
 *  get:
 *    tags: [Accounts]
 *    summary: The accounts of all users for admins
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Account'
 *      401:
 *        description: unauthorized
 *      403:
 *        description: forbidden
 */
app.get("/allAccounts", authToken, authRole(["admin"]), (req, res) => {
  res.json(accounts);
});

/**
 * @openapi
 * /login:
 *  post:
 *    tags: [Users]
 *    summary: Logs into the application
 *    security: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The user's username
 *            required:
 *              - username
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *                refreshToken:
 *                  type: string
 *      404:
 *        description: not found
 */
app.post("/login", (req, res) => {
  const user = users.find((u) => u.username === req.body.username);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  const accessToken = jwt.sign({ user }, ACCESS_TOKEN_SECRET!, {
    expiresIn: TOKEN_EXPIRATION_TIME,
  });
  const refreshToken = jwt.sign({ user }, REFRESH_TOKEN_SECRET!);

  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

/**
 * @openapi
 * /logout:
 *  delete:
 *    tags: [Users]
 *    summary: Logs out of the application
 *    security: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *            required:
 *              - refreshToken
 *    responses:
 *      204:
 *        description: success
 */
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((t) => t !== req.body.refreshToken);
  res.sendStatus(204);
});

/**
 * @openapi
 * /token:
 *  post:
 *    tags: [Users]
 *    summary: Issue new access tokens
 *    security: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *            required:
 *              - refreshToken
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *      401:
 *        description: unauthorized
 */
app.post("/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.sendStatus(401);
    return;
  }
  if (!refreshTokens.includes(refreshToken)) {
    res.sendStatus(401);
    return;
  }

  try {
    // @ts-ignore
    const { user } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!);

    const accessToken = jwt.sign({ user }, ACCESS_TOKEN_SECRET!, {
      expiresIn: TOKEN_EXPIRATION_TIME,
    });

    res.json({ accessToken });
  } catch (error) {
    res.sendStatus(401);
  }
});

function authToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    // @ts-ignore
    const { user } = jwt.verify(token, ACCESS_TOKEN_SECRET!);
    req.user = user;
    next();
  } catch (error) {
    res.sendStatus(401);
  }
}

function authRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      res.sendStatus(403);
      return;
    }
    next();
  };
}

app.listen(3000, () => {
  swaggerDocs(app);
  console.log("Server running...");
});
