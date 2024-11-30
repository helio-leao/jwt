/**
 * @openapi
 * components:
 *  schemas:
 *    Account:
 *      type: object
 *      required:
 *        - user
 *        - balance
 *      properties:
 *        user:
 *          type: string
 *          description: The id of the user that owns the account
 *        balance:
 *          type: number
 *          description: The balance of the account
 *      example:
 *        id: "1"
 *        balance: 999.9
 */

export default [
  {
    user: "1",
    balance: 100,
  },
  {
    user: "2",
    balance: 55000,
  },
];
