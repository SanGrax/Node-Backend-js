'use stric'
var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;

        return res.status('200').send({     
                curso: 'Master en frames',
                autor: 'Santiago',
                hola               
            });
    },

    test:(req,res) => {
        return res.status(200).send({
        message: 'Soy la accion test de mi controlador de articulos'
        });  
    },
    save: (req,res) => {
            //Recoger los parametros por POST
            var params = req.body;

            //Validar datos (validator)
            try{
                var validate_title = !validator.isEmpty(params.title);
                var validate_content = !validator.isEmpty(params.content);

            }catch(err){
                return res.status(200).send({
                    status:'error',
                    message: 'Faltan datos para enviar '
                    });  
            }

            if( validate_title && validate_content){
                //Crear Objeto a guardar
                var article = new Article();
                //Asignar valores
                article.title = params.title;
                article.content = params.content;
                article.image = null;

                //Guardar articulo
                article.save()
                .then(articleStored => {
                    if (!articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Los datos no se guardaron'
                    });
                    }
                    // Devolver una respuesta
                    return res.status(200).send({
                    status: 'success',
                    article: articleStored
                    });
                })
                .catch(err => {
                    return res.status(500).send({
                    status: 'error',
                    message: 'Error al guardar los datos'
                    });
                });
        }else {
            return res.status(404).send({
                status:'error',
                message: 'Los datos no son validos'
                });  
        }

    },
    getArticles: (req, res) => {
        var query = Article.find({});
        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        }
        // Find
        query.sort('-_id').exec()
            .then(articles => {
            if (!articles || articles.length === 0) {
                return res.status(404).send({
                status: 'error',
                message: 'No hay artículos para mostrar'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
            })
            .catch(err => {
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver los artículos'
            });
            });
        },
        getArticle: (req, res) => {
            // Recoger el id de la URL
            var articleId = req.params.id;
            // Comprobar que existe
            if (!articleId || articleId == null) {
                return res.status(404).send({
                status: 'error',
                message: 'No existe el artículo !!!'
                });
            }
            // Buscar el artículo
            Article.findById(articleId)
                .then(article => {
                if (!article) {
                    return res.status(404).send({
                    status: 'error',
                    message: 'No existe el artículo !!!'
                    });
                }

                // Devolverlo en JSON
                return res.status(200).send({
                status: 'success',
                article
                });
            })
            .catch(err => {
                return res.status(500).send({
                status: 'error',
                message: 'Error al buscar el artículo !!!'
                });
            });
        },
        update: (req, res) => {
            // Recoger el id del artículo por la URL
            var articleId = req.params.id;
            // Recoger los datos que llegan por PUT
            var params = req.body;
            // Validar datos
            try {
                var validate_title = !validator.isEmpty(params.title);
                var validate_content = !validator.isEmpty(params.content);
            } catch (err) {
                return res.status(400).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
                });
            }
            if (validate_title && validate_content) {
              // Find and update
                Article.findOneAndUpdate({ _id: articleId }, params, { new: true })
                .then(articleUpdated => {
                    if (!articleUpdated) {
                        return res.status(404).send({
                        status: 'error',
                        message: 'No existe el artículo !!!'
                    });
                }
                    return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                    });
                })
                .catch(err => {
                    return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar !!!'
                    });
                });
            } else {
              // Devolver respuesta
                return res.status(400).send({
                status: 'error',
                message: 'La validación no es correcta !!!'
                });
            }
        },
        delete: (req, res) => {
            // Recoger el id de la URL
            var articleId = req.params.id;
        
            // Find and delete
            Article.findOneAndDelete({_id: articleId})
                .then(articleRemoved => {
                    if(!articleRemoved){
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se ha borrado el artículo, posiblemente no exista !!!'
                        });
                    }
        
                    return res.status(200).send({
                        status: 'success',
                        article: articleRemoved
                    });
                })
                .catch(err => {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al borrar !!!'
                    });
                });
        },
        upload: (req, res) => {
            // Recoger el fichero de la petición
            var file_name = 'Imagen no subida...';
        
            if (!req.files) {
                return res.status(404).send({
                    status: 'error',
                    message: file_name
                });
            }
        
            // Conseguir nombre y la extensión del archivo
            var file_path = req.files.file0.path;
            var file_split = file_path.split('\\');
        
            // Nombre del archivo
            var file_name = file_split[2];
        
            // Extensión del fichero
            var extension_split = file_name.split('\.');
            var file_ext = extension_split[1];
        
            // Comprobar la extension, solo imagenes, si es valida borrar el fichero
            if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
        
                // borrar el archivo subido
                fs.unlink(file_path, (err) => {
                    return res.status(200).send({
                        status: 'error',
                        message: 'La extensión de la imagen no es válida !!!'
                    });
                });
        
            } else {
                // Si todo es valido, sacando id de la URL
                var articleId = req.params.id;
        
                if (articleId) {
                    // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                    Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true })
                        .then(articleUpdated => {
                            if (!articleUpdated) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'Error al guardar la imagen del artículo !!!'
                                });
                            }
                            return res.status(200).send({
                                status: 'success',
                                article: articleUpdated
                            });
                        })
                        .catch(err => {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar la imagen del artículo !!!'
                            });
                        });
                } else {
                    return res.status(200).send({
                        status: 'success',
                        image: file_name
                    });
                }
            }
        }, // end upload file
        getImage: (req, res) => {
            var file = req.params.image;
            var path_file = './upload/articles/' + file;
        
            new Promise((resolve, reject) => {
                fs.exists(path_file, (exists) => {
                    if (exists) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            })
            .then(() => {
                return res.sendFile(path.resolve(path_file));
            })
            .catch(() => {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe !!!'
                });
            });
        },
        search: (req, res) => {
            // Sacar el string a buscar
            var searchString = req.params.search;
        
            // Find or
            Article.find({ "$or": [
                { "title": { "$regex": searchString, "$options": "i"}},
                { "content": { "$regex": searchString, "$options": "i"}}
            ]})
            .sort([['date', 'descending']])
            .then(articles => {
                if(!articles || articles.length <= 0){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay artículos que coincidan con tu búsqueda !!!'
                    });
                }
        
                return res.status(200).send({
                    status: 'success',
                    articles
                });
            })
            .catch(err => {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición !!!'
                });
            });
        }        
};//end Controller



module.exports = controller;