const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("../models/User");
const Usuario = mongoose.model("User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const usuario = await Usuario.findOne({ email });

          if (!usuario) {
            return done(null, false, { message: "Usuário ou senha inválidos" });
          }

          // Comparação da senha
          const match = await bcrypt.compare(password, usuario.password);
          if (!match) {
            return done(null, false, { message: "Usuário ou senha inválidos" });
          }

          return done(null, usuario);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const usuario = await Usuario.findById(id);
      done(null, usuario);
    } catch (error) {
      done(error);
    }
  });
};
