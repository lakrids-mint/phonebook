const mongoose = require("mongoose");
// Get user input
const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

//DB URL
const url = `mongodb+srv://admin:${password}@clusterlearning-etspv.mongodb.net/phonebook?retryWrites=true&w=majority`;
mongoose.connect(url, { useNewUrlParser: true });

//Schema defined
const personSchema = new mongoose.Schema({
  name: String,
  number: Number
});

const Person = mongoose.model("Person", personSchema);

//local const which holds user input
const person = new Person({
  name: name,
  number: number
});
//saves const person to db
const savePerson = () => {
  person.save().then(response => {
    console.log("person saved!");
    mongoose.connection.close();
  });
};
//Returns all people from the db
const findPerson = () => {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, ": ", person.number);
    });
    mongoose.connection.close();
  });
};
//Determines which action to take based on amount of arguments user inputs
if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
} else if (process.argv.length === 3) {
  findPerson();
} else {
  savePerson();
}
