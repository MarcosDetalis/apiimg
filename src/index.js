const express = require("express")
const path = require("path")
const multer = require("multer")
const app = express()
const fs = require("fs")
const url = require("url")
const { json } = require("express")
const cors = require("cors")
 //Variables
let nombre
//Configuracion
app.set('port',process.env.PORT||4000)
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
//Middlewares
app.use(express.urlencoded({ extended: false })) //middlewares
app.use(cors())
//Para usar archivos estaticos
app.use(express.static(path.join(__dirname, "public")))
//Leemos el archivo json
const json_books = fs.readFileSync("src/books.json", "utf-8");
let books = JSON.parse(json_books);
//Guardamos las imaganes que van a ser procesadas por multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/img'), //definimos la carpeta donde se guardara las imgs
    filename: (req, file, cb, filename) => {
        console.log(file);
        nombre = file.originalname
        cb(null, (file.originalname)); //guardamos con el nombre original
    }
})
let subir = multer({ storage: storage })
app.post("/subir", subir.single('image')
    /*Definimos que los archivos subidos 
    seran de a uno y le damos el name del html*/
    , (req, res) => {
        //Optenemos el tipo de protocolo que se utiliza mas el nombre
        let url = req.protocol + '://' + req.get('host')
        const { title, autor } = req.body;
        if (!title ||!nombre||!autor) {
            res.status(400).send("Ingrese todo los campos");
            return;
        }
        //hacemos un map al json para obtener la id mayor
        let ids = books.map(clave => clave.id)
        let maxid  = Math.max(...ids)
        maxid < 0 ? maxid = 0:{} 
        let id = maxid + 1
        let newBook = {
            id,
            autor,
            title,
            image: url + "/img/" + nombre,
        };
        books.push(newBook);
        //escribimos los datos al archivo json
        const json_books = JSON.stringify(books);
        fs.writeFileSync("src/books.json", json_books, "utf-8");
        //res.json(books)
        res.send("<h1> Enviado</h1>")
    })
//definimos un get dinamico que se le puede pedir un parametro
app.get('/apis/:title', (req, res) => {
    const title = req.params.title //obtenemos el parametro ingresado
    const titles = books.find(titles => titles.title == title) //comparamos si dicho dato es igual a los del json
    console.log(titles)
    titles == null ? (
    res.status(404).send("Archivo no existe")
    ) : (
        res.json(titles)
    )
})
//devolvemos todo los datos del json
app.get('/apis', (req, res) => {
  res.json(books)
})
//mostramos el contenido con las imagnes
app.get('/ejs', (req, res) => {
    res.render('index', { books })
})
//si no encontramos la ruta
app.get("/404", (req, res) => {
    res.sendFile(__dirname + "/public/img/404.gif")
})
app.use((req, res) => {
    res.redirect("/404")
})
app.listen(app.get('port'), () => {
    console.log("Server on port 4000")
})