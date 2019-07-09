/* TO DEPLOY:
  - build frontend --prod and copy build to backend dir
  - server -> commit and push to git
  - log in to heroku
  - git push heroku master
*/
const express = require("express")
const server = express()
require("dotenv").config()
const bodyParser = require("body-parser")
//const morgan = require("morgan");

/* The body-parser functions so that it takes the JSON data of a request, 
transforms it into a JavaScript object and then attaches it to the body property 
of the request object before the route handler is called. 
Without a body-parser, the body property would be undefined.
 */
const Person = require("./models/person")
/* whenever express gets a HTTP GET-request
 it will first check if the build directory contains a file 
 corresponding to the requests address. If a correct
  file is found, express will return it. */
server.use(express.static("build"))
server.use(bodyParser.json())

const cors = require("cors")
server.use(cors())

//server.use(morgan("tiny"));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:  ", request.path)
  console.log("Body:  ", request.body)
  console.log("---")
  next()
};

server.use(requestLogger)

//helper function - checks if name already exists
/* const isDuplicate = name => {
  for (let i = 0; i < persons.length; i++) {
    if (persons[i].name.toLowerCase() === name.toLowerCase()) {
      return true;
    }
  }
};
 */

//GET root
server.get("/", (req, res) => {
  console.log("root destination")
  res.send("<h1>Hello from express server!</h1>")
})

//Fetch all persons
server.get("/api/people", (req, res) => {
  Person.find({})
    .then(people => {
      console.log("get all people: ")
      res.json(people.map(person => person.toJSON()))
    })
    .catch(error => next(error))
})
//return one specific person
server.get("/api/people/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
})
//POST data
server.post("/api/people", (req, res, next) => {
  const body = req.body
  console.log("req.body: ", req.body)
  if (!body.name || !body.number) {
    console.log("Error: !body.name")
    return res.status(400).json({
      error: "Name or number missing"
    })
  }
  console.log("making person object:")
  const person = new Person({
    name: body.name,
    number: body.number
  })
  console.log("person:", person)
  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

//delete ressource
server.delete("/api/people/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
})

/* Middleware functions that are only called if no route handles the HTTP request.
  This one is used for catching requests made to non-existent routes. 
  For these requests, the middleware will return an error message in the JSON format. */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
};
server.use(unknownEndpoint)

// Middleware errorhandling
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === "CastError" && error.kind == "ObjectId") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }
  next(error)
};
server.use(errorHandler)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`)
})
