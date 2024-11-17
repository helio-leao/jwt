import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import users from "./mocks/users.json";
import accounts from "./mocks/accounts.json";

const app = express();
app.use(express.json());

const EXPIRATION_TIME = "10m";

// NOTE: secrets created by running node on terminal and require("crypto").randomBytes(64).toString("hex")
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

// NOTE: should be in a database on production
let refreshTokens: string[] = [];

// NOTE: protected route for testing purposes
app.get("/accounts", authenticateToken, (req, res) => {
  res.json(accounts.filter((account) => account.user === req.user.id));
});

app.post("/login", (req, res) => {
  const user = users.find((u) => u.username === req.body.username);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET!, {
    expiresIn: EXPIRATION_TIME,
  });
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET!);

  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((t) => t !== req.body.refreshToken);
  res.sendStatus(204);
});

app.post("/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.sendStatus(401);
    return;
  }
  if (!refreshTokens.includes(refreshToken)) {
    res.sendStatus(403);
    return;
  }

  try {
    const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!);

    // @ts-ignore
    const user = { id: decodedToken.id, username: decodedToken.username };

    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET!, {
      expiresIn: EXPIRATION_TIME,
    });

    res.json({ accessToken });
  } catch (error) {
    res.sendStatus(403);
  }
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET!);
    req.user = user;
    next();
  } catch (error) {
    res.sendStatus(403);
  }
}

app.listen(3000, () => console.log("Server running..."));
