import { Application, Request, Response } from "express";
import { Expenses, Table } from "../../types";
import { dbConnection, generateUUID } from "../../dbConnection";
import expressAsyncHandler from "express-async-handler";

export function expensesRouter(app: Application) {
  app.get(
    "/expenses",
    expressAsyncHandler(async (req, res) => {
      const { year, month } = req.query;

      if (!year || !month) {
        res
          .status(400)
          .send({ error: "Year and month are required query parameters" });
        return;
      }

      const startDate = `${year}-${month.toString().padStart(2, "0")}-00`;
      const endDate = `${year}-${month.toString().padStart(2, "0")}-32`;

      const expenses = await dbConnection<Expenses>(Table.Expenses)
        .select()
        .where({ user_id: req.userId })
        .whereBetween("date", [startDate, endDate])
        .orderBy("date", "asc")
        .limit(15_000);

      res.send(expenses);
    })
  );

  app.get(
    "/expense/:id",
    expressAsyncHandler(async (req, res) => {
      const expenses = await dbConnection<Expenses>(Table.Expenses)
        .select()
        .where({ id: req.params.id, user_id: req.userId })
        .limit(1);

      const expense = expenses.at(0);
      if (!expense) {
        res.status(404);
        return;
      }

      res.send(expense);
    })
  );

  async function upsertExpense(id: string, req: Request, res: Response) {
    const { description, date, amount, currency, category, type } = req.body;

    if (!description || !date || !amount || !currency || !type) {
      throw Error("Invalid params");
    }

    await dbConnection<Expenses>(Table.Expenses)
      .insert({
        id,
        user_id: req.userId,
        description,
        date,
        amount,
        currency,
        category,
        type,
        updated_at: new Date(),
      })
      .onConflict("id")
      .merge();

    res.send({});
  }

  app.post(
    "/expense",
    expressAsyncHandler(async (req, res) => {
      await upsertExpense(generateUUID(), req, res);
    })
  );

  app.post(
    "/expenses/bulk",
    expressAsyncHandler(async (req, res) => {
      const expenses = req.body.expenses;

      if (!Array.isArray(expenses) || expenses.length === 0) {
        res.status(400).send({ error: "Invalid or empty expenses array" });
        return;
      }

      const insertData = expenses.map((expense) => ({
        id: generateUUID(),
        user_id: req.userId,
        description: expense.description,
        date: expense.date,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        type: expense.type,
        updated_at: new Date(),
      }));

      await dbConnection<Expenses>(Table.Expenses).insert(insertData);

      res.send({
        count: insertData.length,
      });
    })
  );

  app.put(
    "/expense/:id",
    expressAsyncHandler(async (req, res) => {
      const expense = (
        await dbConnection<Expenses>(Table.Expenses)
          .select()
          .where({ id: req.params.id })
          .limit(1)
      ).at(0);

      if (!expense || expense.user_id !== req.userId) {
        throw Error("invalid expense");
      }

      await upsertExpense(req.params.id, req, res);
    })
  );

  app.delete(
    "/expense/:id",
    expressAsyncHandler(async (req, res) => {
      await dbConnection<Expenses>(Table.Expenses)
        .delete()
        .where({ id: req.params.id, user_id: req.userId });

      res.send({});
    })
  );
}
