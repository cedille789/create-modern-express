<% if (view) { -%>
import cookieParser from "cookie-parser";
import createError from "http-errors";
import express from "express";
import logger from "morgan";
import path from "path";
import url from "url";
<% } else { -%>
import cookieParser from "cookie-parser";
import express from "express";
import logger from "morgan";
import path from "path";
import url from "url";
<% } -%>

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

<%= "" _%> import indexRouter from "./routes/index.js";

const app = express();

<% if (view) { -%>
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "<%= view %>");
<% } -%>

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

<% if (view) { -%>
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.status = err.status;
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { title: `${err.status} ${err.message}` });
});
<% } -%>

export default app;
