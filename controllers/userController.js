const User = require("../models/User");
const MovieLists = require("../models/UserMoovies");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const session = require("express-session");

module.exports = class UserController {
  //register
  static async registerUser(req, res) {
    const { userName, email, password } = req.body;
    let { name } = req.body;

    // Verifica se veio uma imagem
    let path, filename;
    if (req.file) {
      path = req.file.path;
      filename = req.file.filename;
    } else {
      path =
        "https://res.cloudinary.com/doszmbyx4/image/upload/v1745071231/istockphoto-1222357475-612x612_kqblw6.jpg";
      filename = "default-profile-image";
    }

    // formatar nome
    function nomeFormatado(nameRaw) {
      return nameRaw
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    name = nomeFormatado(name);

    //VALIDAÇÕES

    if (!userName || !name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos os campos precisam ser preenchidos" });
    }

    const nameExists = await User.findOne({ name: name });

    if (nameExists) {
      return res.status(400).json({ message: "Nome já existe" });
    }

    const userNameExists = await User.findOne({ userName: userName });

    if (userNameExists) {
      return res.status(400).json({ message: "Nome de usuário já existe" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }

    // encriptar senha

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    //Salvar usuário

    const user = new User({
      name,
      userName,
      email,
      password: hashedPassword,
      profileImage: {
        public_id: filename,
        path: path,
      },
    });

    try {
      await user.save();
      res.status(201).json({
        message: "Usuário criado com sucesso",
        data: user,
      });
    } catch (e) {
      console.error(error);
      return res.status(400).json({ message: "falha ao registrar" });
    }
  }

  //update da foto de perfil
  static async updateProfileImage(req, res) {
    const { id } = req.params;
    const { path, filename } = req.file;

    if (!path) {
      return res.status(400).json({
        message:
          "Para atualizar sua imagem de perfil, você precisa enviar uma imagem",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    user.profileImage.public_id = filename;
    user.profileImage.path = path;

    const imageObj = {
      public_id: filename,
      path: path,
    };

    try {
      await user.save();
      return res
        .status(200)
        .json({ message: "Imagem atualizada com sucesso", data: imageObj });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Erro ao atualizar imagem de perfil" });
    }
  }

  //login
  static async loginUser(req, res, next) {
    try {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return res.status(500).json({ message: "Erro interno no servidor" });
        }
        if (!user) {
          return res
            .status(401)
            .json({ message: info.message || "Usuário ou senha inválidos" });
        }

        // Faz login do usuário e cria a sessão
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Falha ao iniciar sessão" });
          }

          // Remove informações sensíveis antes de enviar ao frontend
          const { password, ...userData } = user.toObject();

          return res.status(200).json({
            message: "Login realizado com sucesso",
            data: userData,
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao tentar fazer login" });
    }
  }

  //logout
  static async logoutUser(req, res) {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");

        return res.json({ message: "Deslogado com sucesso" });
      });
    });
  }

  //Confirmar senha
  static async confirmPassword(req, res) {
    const id = req.params.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Precisamos do campo senha",
      });
    }

    const user = await User.findById(id);

    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
      return res.status(400).json({
        message: "Senha inválida",
      });
    }

    return res.status(200).json({ message: "Senha confere com o usuário" });
  }

  //edita nome
  static async editName(req, res) {
    const { id } = req.params;
    var { name } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "não conseguimos achar o id",
      });
    }

    const nomeCompleto = name.includes(" ");

    if (!nomeCompleto) {
      return res
        .status(400)
        .json({ message: "Nome precisa ser válido e completo" });
    }

    function nomeFormatado(nameRaw) {
      return nameRaw
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    name = nomeFormatado(name);

    if (name.length < 2 || name.length > 50) {
      return res
        .status(400)
        .json({ message: "Nome precisa ter entre 2 e 50 caracteres" });
    }

    if (!name) {
      return res.status(400).json({ message: "Precisamos do nome" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (name === user.name) {
      return res.status(400).json({ message: "Nome já está em uso" });
    }

    try {
      await User.findByIdAndUpdate(id, { name: name });
      res
        .status(200)
        .json({ message: "Nome do usuário atualizado com sucesso" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro ao editar nome" + err.message });
    }
  }

  ///edita nome de usuário
  static async editUserName(req, res) {
    const { id } = req.params;
    const { userName } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "não conseguimos achar o id",
      });
    }

    if (!userName) {
      return res.status(400).json({ message: "Precisamos do nome de usuário" });
    }

    const user = await User.findById(id);

    if (userName === user.userName) {
      return res
        .status(400)
        .json({ message: "Nome de usuário já está em uso" });
    }

    try {
      return await User.findByIdAndUpdate(id, { userName: userName }).then(
        () => {
          res
            .status(200)
            .json({ message: "Nome de usuário atualizado com sucesso" });
        }
      );
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Erro ao editar nome de usuário" });
    }
  }

  //edita e-mail
  static async editEmail(req, res) {
    const { id } = req.params;
    const { email } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "não conseguimos achar o id",
      });
    }
    if (!email) {
      return res.status(400).json({ message: "Precisamos do e-mail" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (email === user.email) {
      return res.status(400).json({ message: "E-mail já está em uso" });
    }

    try {
      await User.findByIdAndUpdate(id, { email: email });
      res.status(200).json({ message: "Email atualizado com sucesso" });
    } catch (e) {
      return res.status(500).json({ message: "Erro ao editar e-mail" });
    }
  }

  //edita senha
  static async editPassword(req, res) {
    const { id } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const samePassword = await bcrypt.compare(password, user.password);

    if (samePassword) {
      return res
        .status(400)
        .json({ message: "Senha não pode ser igual à atual" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      password: hashedPassword,
    };

    try {
      return await User.findOneAndUpdate(
        { _id: userId },
        { password: userData }
      );
    } catch (e) {
      return res.status(500).json({ message: "Erro ao editar senha" });
    }
  }

  //deleta usuário
  static async deleteUser(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        message: "NÂO FOI FORNECIDO O ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    try {
      const listasUser = await MovieLists.find({ userId: user._id });

      await Promise.all(
        listasUser.map((lista) => MovieLists.findByIdAndDelete(lista._id))
      );

      await User.findByIdAndDelete(id);

      req.logout(() => {
        req.session.destroy();
      });

      return res.status(200).json({ message: "Conta deletada com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao deletar conta" });
    }
  }
};
