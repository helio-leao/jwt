import { JwtPayload } from "jsonwebtoken";
import User from "./User";

export default interface TokenPayload extends JwtPayload {
  user: User;
}
