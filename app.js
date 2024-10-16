const express = require("express")
const morgan = require("morgan")
const path = require("path")
const fs = require("fs")
const app = express()
// Port for the app, if process.env.PORT is not defined, the app will redirect to port 3000
const PORT = process.env.PORT || 3000

// Set writing stream in append mode
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'))

// Middleware setup
app.use(express.json())
app.use(morgan("combined", { stream: accessLogStream }))

const facts_list = [
  "Honey never spoils.",
  "Octopuses have three hearts.",
  "Bananas are berries, but strawberries aren't.",
  "Wombat poop is cube-shaped.",
  "Humans share 60% of their DNA with bananas.",
  "Sharks existed before trees.",
  "A day on Venus is longer than a year on Venus.",
  "There are more stars in the universe than grains of sand on Earth."
];

app.get("/", (req, res) => {
  res.status(201).json(
    {
      message: "Welcome to random fact API! ",
      endpoints:
      {
        "/getFact": "This gives you a random fact available on the mini local database",
        "/getAllFacts": "Lets you know all of the avaiable facts on the API",
        "/addFact": "Allows to add facts",
        "/updateFact": "Allows to update facts",
        "/deleteFact": "Allows to remove facts"
      }
    })
})

// First argument: endpoint
// Second argument: {1: HTTP method, headers and request body, 2: Methods to send a response, send, json, render.}
app.get("/getFact", (req, res) => {
  const randomIndex = Math.floor(Math.random() * facts_list.length)
  const randomFact = facts_list[randomIndex]

  res.status(201).json({ fact: `${randomFact}` })
})

app.get("/getAllFacts", (req, res) => {
  if (facts_list === "") {
    res.status(400).json({ error: "There are no facts right now!" })
  } else {
    res.status(201).json({ facts: facts_list })
  }
})

app.post("/addFact", (req, res) => {
  const newFact = req.body.fact

  if (newFact === "" || newFact.length < 10) {
    res.status(400).json({ error: "Fact must not be empty or it's too short." })
  } else if (facts_list.includes(newFact)) {
    res.status(400).json({ error: "Fact already exists." })
  } else {
    facts_list.push(newFact)
    res.status(201).json({ message: "Fact added successfully.", fact: `${newFact}` })
  }
})

app.put("/updateFact/:index", (req, res) => {
  const factIndex = parseInt(req.params.index)
  const updatedFact = req.body.fact

  if (updatedFact === "" || updatedFact.length < 10) {
    res.status(400).json({ error: "Fact must not be empty or it's too short." })
  }
  if (factIndex < 0 || factIndex >= facts_list.length) {
    res.status(400).json({ error: "Fact not found." })
  }
  if (facts_list.includes(updatedFact)) {
    res.status(400).json({ error: "Fact already exists." })
  }

  facts_list[factIndex] = updatedFact
  res.status(201).json({ message: "Fact successfully updated", fact: `${updatedFact}` })

})

app.delete("/deleteFact/:index", (req, res) => {
  const factIndex = req.params.index

  if (factIndex < 0 || factIndex >= facts_list.length) {
    return res.status(404).json({ error: "Fact not found." });
  } else {
    const deletedFact = facts_list.splice(factIndex, 1);
    res.json({ message: "Fact deleted successfully!", fact: deletedFact[0] });
  }

})

app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`)
})