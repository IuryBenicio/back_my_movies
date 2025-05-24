const router = require("express").Router();
const MooviesController = require("../controllers/mooviesController");

// adiciona uma lista ao usuário
router.post("/addlist", MooviesController.addListToUser);

// remove uma lista de um usuário
router.post("/removelist", MooviesController.removeListfromUser);

// edita o nome de uma lista de um usuário
router.post("/editnamelist", MooviesController.editListName);

// edita a descrição de uma lista de um usuário
router.post("/editdescriptionlist", MooviesController.editListDescription);

// retorna todas as listas de um usuário
router.get("/lists/:id", MooviesController.returnAllLists);

// retorna todas os filmes de uma lista de um usuário
router.get("/listmovies/:id", MooviesController.returnList);

// adiciona um filme a uma lista de um usuário
router.post("/addmovie", MooviesController.addMoovieToList);

// remove um filme de uma lista de um usuário
router.post("/removemovie", MooviesController.removeMoovieFromList);

// marca um filme como assistido ou não assistido
router.post("/markmovie", MooviesController.markMovie);

// retorna as listas em que um filme está presente
router.post("/movieinlists", MooviesController.returnListsWhereMovieIsPresent);

module.exports = router;
