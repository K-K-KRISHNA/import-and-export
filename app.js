const express = require("express");
const app = express();
const time = require("date-fns");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;
const intializer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
};
intializer();
function checkTodoStatus(status) {
  return (
    status === "" ||
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE"
  );
}
function checkTodoPriority(priority) {
  return (
    priority === "" ||
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    priority === "LOW"
  );
}
function checkTodoCategory(category) {
  return (
    category === "" ||
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  );
}
const changeDate = (due_date) => {
  return time.format(new Date(due_date), "yyyy-MM-dd");
};

const DbObjToResObj = (DbObj) => {
  let dueDate = changeDate(DbObj.due_date);
  return {
    id: DbObj.id,
    todo: DbObj.todo,
    priority: DbObj.priority,
    status: DbObj.status,
    category: DbObj.category,
    dueDate: dueDate,
  };
};
function checkRequestInQuery(request, response, next) {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  if (!checkTodoStatus(status)) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!checkTodoPriority(priority)) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!checkTodoCategory(category)) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
}
function checkRequestInBody(request, response, next) {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.body;
  if (!checkTodoStatus(status)) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!checkTodoPriority(priority)) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!checkTodoCategory(category)) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
}

app.get("/todos/", checkRequestInQuery, async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  //console.log(status, priority, search_q);
  const dbQuery = `
        SELECT * FROM todo 
        WHERE status LIKE '%${status}%' 
        AND priority LIKE '%${priority}%' 
        AND todo LIKE '%${search_q}%'
        AND category LIKE '%${category}';`;
  const array = await db.all(dbQuery);
  response.send(array.map((every) => DbObjToResObj(every)));
});

app.get("/todos/:todoId/", checkRequestInBody, async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `
    SELECT * FROM todo WHERE id = ${todoId};`;
  const item = await db.get(dbQuery);
  response.send(DbObjToResObj(item));
});
app.post("/todos/", checkRequestInBody, async (request, response) => {
  const {
    id = "",
    todo = "",
    status = "",
    priority = "",
    category = "",
    dueDate = "",
  } = request.body;
  dueDate = stringToDate(dueDate);
  const dbQuery = `
        INSERT INTO todo (id,todo,status,priority,category,due_date) VALUES (${id},'${todo}','${status}','${priority}','${category}','${dueDate}');`;
  await db.run(dbQuery);
  response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", checkRequestInBody, async (request, response) => {
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "", category = "" } = request.body;
  let dbquery;
  if (status != "") {
    dbquery = `
            UPDATE todo 
            SET status = '${status}' WHERE id = ${todoId};`;
    await db.run(dbquery);
    response.send("Status Updated");
  } else if (priority != "") {
    dbquery = `
            UPDATE todo 
            SET priority = '${priority}' WHERE id = ${todoId};`;
    await db.run(dbquery);
    response.send("Priority Updated");
  } else if (category !== "") {
    dbquery = `
            UPDATE todo 
            SET category = '${category}' WHERE id = ${todoId};`;
    await db.run(dbquery);
    response.send("Category Updated");
  } else {
    dbquery = `
            UPDATE todo 
            SET todo = '${todo}' WHERE id = ${todoId};`;
    await db.run(dbquery);
    response.send("Todo Updated");
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `
    DELETE FROM todo WHERE id = ${todoId};`;
  db.run(dbQuery);
  response.send(`Todo Deleted`);
});

function stringToDate(given) {
  let temp = new Date(given);
  let result = time.format(temp, "yyyy-MM-dd");
  return result;
}

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let dateObj = stringToDate(date);
  const dbQuery = `
  SELECT * FROM todo WHERE
  due_date = ${dateObj};`;
  const array = await db.all(dbQuery);
  response.send(array.map((item) => DbObjToResObj(item)));
});
module.exports = app;
