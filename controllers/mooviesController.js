const User = require("../models/User");
const MoovieList = require("../models/UserMoovies");
const mongoose = require("mongoose");

module.exports = class MoovieListController {
  // Edita nome de uma lista de um usuário
  static async editListName(req, res) {
    const { listId, newName, userId } = req.body;

    const list = await MoovieList.findById(listId);

    if (!newName) {
      return res.status(400).json({ message: "Faltando nome para editar" });
    }

    if (!list) {
      return res
        .status(404)
        .json({ message: "Lista de filmes não encontrada" });
    }

    if (list.name === newName) {
      return res
        .status(400)
        .json({ message: "Nome não pode ser igual ao atual" });
    }

    try {
      const user = await User.findById(userId);

      const listUpdate = user.moovieLists.find(
        (l) => String(l._id) === String(listId)
      );

      if (listUpdate) {
        if (listUpdate.name === newName) {
          return res.status(400).json({ message: "Nome antigo igual ao novo" });
        }
      }

      listUpdate.name = newName;

      await user.save();
      await MoovieList.findByIdAndUpdate(
        listId,
        { name: newName },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Nome da lista editada com sucesso" });
    } catch {
      return res
        .status(500)
        .json({ message: "Erro ao editar nome da lista de filmes" });
    }
  }

  // Edita descrição de uma lista de um usuário
  static async editListDescription(req, res) {
    const { listId, newDescription, userId } = req.body;

    if (!listId) {
      return res.status(400).json({ message: "Faltando id para editar" });
    }
    if (!newDescription) {
      return res
        .status(400)
        .json({ message: "Faltando descrição para editar" });
    }
    const list = await MoovieList.findById(listId);
    if (!list) {
      return res
        .status(404)
        .json({ message: "Lista de filmes não encontrada" });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "Usuário não encontrado" });
      }

      const listUpdate = user.moovieLists.find(
        (l) => String(l._id) === String(listId)
      );

      if (listUpdate) {
        if (listUpdate.description === newDescription) {
          return res.status(400).json({ message: "Descrição igual a antiga" });
        }
      }

      listUpdate.description = newDescription;

      await user.save();
      await MoovieList.findByIdAndUpdate(
        listId,
        { description: newDescription },
        { new: true }
      );
      return res.status(200).json({ message: "Descrição atualizada" });
    } catch {
      return res
        .status(500)
        .json({ message: "Erro ao editar descrição da lista de filmes" });
    }
  }

  // Adiciona lista a um usuário
  static async addListToUser(req, res) {
    const { name, userId } = req.body;
    var { description } = req.body;

    // validações
    if (!name || !userId) {
      return res.status(400).json({ message: "Faltam informações" });
    }

    if (!description) {
      const stringVazia = "...";
      description = stringVazia;
    }

    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const newList = new MoovieList({
      userId: userId,
      description: description,
      name: name,
      // moovieList: [],
    });

    const listMoviesExist = await MoovieList.findOne({
      name: newList.name,
    }).where({ userId: userId });

    if (listMoviesExist) {
      return res
        .status(400)
        .json({ message: "Já existe uma lista com esse nome" });
    }

    try {
      await newList.save();
      const idList = newList._id;
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            moovieLists: {
              _id: idList._id,
              name: newList.name,
              description: newList.description,
            },
          },
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Lista de filmes adicionada com sucesso" });
    } catch (err) {
      return res.status(500).json(err.errmsg);
    }
  }

  // Remove lista de um usuário
  static async removeListfromUser(req, res) {
    const { listId, userId } = req.body;

    // validações
    if (!listId || !userId) {
      return res.status(400).json({ message: "Faltam informações" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const UserWithOutList = user.moovieLists.filter(
      (list) => list._id.toString() != listId
    );

    if (user.moovieLists.length === UserWithOutList.length) {
      return res
        .status(404)
        .json({ message: "Usuário não possui essa lista de filmes" });
    }

    user.moovieLists = UserWithOutList;

    try {
      await MoovieList.findByIdAndDelete(listId);

      await user.save();

      return res
        .status(200)
        .json({ message: "Lista de filmes removida com sucesso" });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  // Retorna todas as listas de um usuário
  static async returnAllLists(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Faltam informações" });
    }

    const user = await User.findById({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    try {
      res.json({ data: user.moovieLists });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Erro ao buscar listas de filmes" + e.message });
    }
  }

  // Restorna lista do banco de dados da lista
  static async returnList(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Faltam informações" });
    }

    try {
      const filmes = await MoovieList.findById(id);

      if (!filmes) {
        return res
          .status(404)
          .json({ message: "Lista de filmes não encontrada" });
      }
      return res.json(filmes);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Erro ao buscar lista de filmes " + e.message });
    }
  }

  // Adiciona filme a uma lista de um usuário
  static async addMoovieToList(req, res) {
    const { listId, overview, moovieId, moovieName, poster_path } = req.body;

    if (!listId || !moovieId || !moovieName || !poster_path) {
      return res.status(400).json({ message: "Faltam informações" });
    }

    const list = await MoovieList.findById(listId);

    if (!list) {
      return res
        .status(404)
        .json({ message: "Lista de filmes não encontrada" });
    }

    const hasMovie = list.moovieList.some((movie) => movie.movieId == moovieId);

    if (hasMovie) {
      return res
        .status(400)
        .json({ message: "Esse filme já pertence a lista escolhida" });
    }

    const newMovie = {
      movieId: moovieId,
      title: moovieName,
      poster_path: `https://image.tmdb.org/t/p/w500${poster_path}`,
      sinopse: overview,
      marqued: "question",
      order: list.moovieList.length,
    };

    list.moovieList.push(newMovie);

    try {
      await list.save();
      return res.json({
        message: "Filme adicionado à lista de filmes com sucesso",
      });
    } catch (e) {
      return res.status(500).json({
        message: "Erro ao adicionar filme à lista de filmes " + e.message,
      });
    }
  }

  // Marca um filme como marcado ou não marcado em uma lista
  static async markMovie(req, res) {
    const { listId, moovieId, mark } = req.body;

    if (!listId) {
      return res.status(400).json({ message: "Falta list" });
    }
    if (!moovieId) {
      return res.status(400).json({ message: "Falta moovieId " + moovieId });
    }
    if (!mark) {
      return res.status(400).json({ message: "Falta marqued" });
    }

    const list = await MoovieList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "List não encontrada" });
    }

    try {
      await MoovieList.findOneAndUpdate(
        { _id: listId, "moovieList.movieId": moovieId },
        { $set: { "moovieList.$.marqued": mark } }
      ).then(() => {
        return res.json({ message: "Filme marcado com sucesso" });
      });
    } catch {
      return res.json({ message: "Erro ao fazer o update do filme" });
    }
  }

  // Remove filme de uma lista de um usuário
  static async removeMoovieFromList(req, res) {
    const { listId, moovieId } = req.body;

    if (!listId || !moovieId) {
      return res.status(400).json({ message: "Faltam informações" });
    }

    const list = await MoovieList.findById(listId);

    if (!list) {
      return res
        .status(404)
        .json({ message: "Lista de filmes não encontrada" });
    }

    const FilmeRetirado = list.moovieList.filter(
      (movie) => movie.movieId != moovieId
    );

    if (FilmeRetirado.length === list.moovieList.length) {
      return res.status(404).json({ message: "DEU ALGUMA MERDA AE" });
    }

    list.moovieList = FilmeRetirado;

    try {
      await list.save();
      return res.status(200).json({
        message: "Filme apagado com sucesso",
      });
    } catch (err) {
      return res.status(500).json({
        message: "Erro ao remover filme da lista de filmes" + err.message,
      });
    }
  }

  // Retorna as listas em que um filme está presente
  static async returnListsWhereMovieIsPresent(req, res) {
    const { moovieId, userId } = req.body;

    if (!moovieId || !userId) {
      return res.status(400).json({
        message: `esse é o moovie: ${String(
          moovieId
        )}, e esse é o user: ${String(userId)}`,
      });
    }
    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    try {
      const listasDoUsuario = await MoovieList.find({ userId: user._id });

      const listasComOFilme = listasDoUsuario.filter((list) =>
        list.moovieList.some(
          (movie) => String(movie.movieId) === String(moovieId)
        )
      );

      return res.status(200).json(listasComOFilme);
    } catch (e) {
      return res.status(500).json({
        message:
          "Erro ao buscar listas em que o filme está presente " + e.message,
      });
    }
  }
};
