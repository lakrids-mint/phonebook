/* TO DEPLOY:
  - server -> commit and push to git
  - log in to heroku
  - git push heroku master
*/
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
/* The body-parser functions so that it takes the JSON data of a request, 
transforms it into a JavaScript object and then attaches it to the body property 
of the request object before the route handler is called. 
Without a body-parser, the body property would be undefined.
 */
const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(morgan("tiny"));

/* server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
}); */
let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

//generate id
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0;
  return maxId + 1;
};
//helper function - checks if names exists
const isDuplicate = name => {
  for (let i = 0; i < persons.length; i++) {
    if (persons[i].name.toLowerCase() === name.toLowerCase()) {
      return true;
    }
  }
};

//POST data
server.post("/api/persons", (req, res) => {
  const body = req.body;
  console.log("req.body: ", req.body);

  if (!body.name && body.number) {
    console.log("Error: !body.name");
    return res.status(400).json({
      error: "content missing"
    });
  } else if (isDuplicate(body.name)) {
    console.log("Name is duplicate");
    return res.status(400).json({
      error: `${body.name} is already in the phonebook`
    });
  } else {
    console.log("making person object:");
    let person = {
      name: body.name,
      number: body.number,
      id: generateId()
    };
    console.log("person:", person);

    persons = persons.concat(person);
    res.json(person);
  }
});

//GET root
server.get("/", (req, res) => {
  res.send("<h1>Hello from express server!</h1>");
});
//Info page
server.get("/api/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
            <br/><p> ${new Date()}</p>`);
});
//Fetch all persons
server.get("/api/persons", (req, res) => {
  res.json(persons);
});
//return one specific person
server.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});
//delete ressource
server.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  console.log(req.params);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
});

/* Middleware functions that are only called if no route handles the HTTP request.
  This one is used for catching requests made to non-existent routes. 
  For these requests, the middleware will return an error message in the JSON format. */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
server.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
