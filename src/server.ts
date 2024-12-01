import express from "express";
import jwt from "jsonwebtoken";
import users from "./mocks/users.json";
import accounts from "./mocks/accounts.json";
import TokenPayload from "./types/TokenPayload";
import { authRole, authToken } from "./middlewares/auth";

const app = express();
app.use(express.json());

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
const TOKEN_EXPIRATION_TIME = "10m";

let refreshTokens: string[] = [];

app.get("/accounts", authToken, (req, res) => {
  res.json(accounts.filter((account) => account.user === req.user.id));
});

app.get("/allAccounts", authToken, authRole(["admin"]), (_req, res) => {
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

app.listen(3000, () => console.log("Server running..."));
