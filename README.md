# Project Overview

This project is a demo of **JWT** authentication and **Roles**.

---

## Endpoints

### Users

- **POST /login**: User login
- **POST /logout**: User logout
- **POST /token**: Issue new access token

### Accounts

- **GET /accounts**: The accounts of the logged in user. This is a protected route.
- **GET /allAccounts**: The accounts of all the users. This is a protected route that requires the role of admin.

---

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install the dependencies.
4. Create a `.env` file at the root of the project.
5. Add the environment variables `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` to the dotenv file.
   You can put your own secret keys.
6. Run `npm run dev` to start the server.  
   To use this command it's necessary to have the .env file in the root of the project. Optionally, you can add a custom `PORT` variable to it. If not defined, the application will run on port 3000.

---

## Example Usage

Once the API is running, you can use it at `http://localhost:3000/`.
