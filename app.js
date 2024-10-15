const express = require("express")
const app = express()
// Port for the app, if process.env.PORT is not defined, the app will redirect to port 3000
const PORT = process.env.PORT || 3000

app.use(express.json())

const facts = [
  "Honey never spoils.",
  "Octopuses have three hearts.",
  "Bananas are berries, but strawberries aren't.",
  "Wombat poop is cube-shaped.",
  "Humans share 60% of their DNA with bananas.",
  "Sharks existed before trees.",
  "A day on Venus is longer than a year on Venus.",
  "There are more stars in the universe than grains of sand on Earth."
];

// First argument: endpoint
// Second argument: {1: HTTP method, headers and request body, 2: Methods to send a response, send, json, render.}
app.get("/getFact", (req, res) => {
  const randomIndex = Math.floor(Math.random() * facts.length)
  const randomFact = facts[randomIndex]
  const fact = {
    "Fact": randomFact,
  }
  res.send(fact)
})

app.get("/getAllFacts", (req, res) => {
  res.send(facts)
})

app.post("/addFact", (req, res) => {
  const newFact = req.body.fact

  if (newFact === "" || newFact.length < 10) {
    res.status(400).json({ "error: ": "Fact must not be empty or it's too short!" })
  } else if (facts.includes(newFact)) {
    res.status(400).json({ "error: ": "Fact already exists!" })
  } else {
    facts.push(newFact)
    res.status(201).json({ message: "Fact added successfully!", fact: newFact })
  }
})

app.put("/updateFact", () => {

})

app.delete("/deleteFact", () => {

})

app.listen(PORT, () => {
  console.log("App listening on port: ", PORT)
})