export default interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}