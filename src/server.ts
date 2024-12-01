import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import users from "./mocks/users.json";
import accounts from "./mocks/accounts.json";
import TokenPayload from "./types/TokenPayload";

const app = express();
app.use(express.json());

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
const TOKEN_EXPIRATION_TIME = "10m";

let refreshTokens: string[] = [];

app.get("/accounts", authToken, (req, res) => {
  res.json(accounts.filter((account) => account.user === req.user.id));
});

app.get("/allAccounts", authToken, authRole(["admin"]), (req, res) => {
  res.json(accounts);
});

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
    res.sendStatus(401);
    return;
  }

  try {
    const { user } = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET!
    ) as TokenPayload;

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
    const { user } = jwt.verify(token, ACCESS_TOKEN_SECRET!) as TokenPayload;
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

app.listen(3000, () => console.log("Server running..."));
