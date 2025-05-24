const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const authConfig = require("./config/auth");
const UserRoutes = require("./routes/userRoutes");
const MovieRoutes = require("./routes/moviesRoutes");

const PORT = process.env.PORT || 8080;

authConfig(passport); // Configura Passport

app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); //

//Configurar Sessão
app.use(
  session({
    secret: "MyMooviesIury",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 36000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

const cors = require("cors");

app.use(
  cors({
    origin: "*", // libera tudo (em produção, depois, pode restringir pro domínio do frontend)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, PATCH, POST, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use("/user", UserRoutes);
app.use("/movie", MovieRoutes);

try {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
} catch (e) {
  console.error("Error starting server:" + e);
}
