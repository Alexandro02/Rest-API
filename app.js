const { body, validationResult } = require("express-validator")
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const app = express()

// Load environment variables from .env file
require('dotenv').config()

// If PORT var is not in .env file, start on port 3000
const PORT = process.env.PORT || 3000

// Set writing stream in append mode
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'))

// Set allowed origins for CORS
// const allowedOrigins = []

// Morgan logging setup
if (process.env.ENV === 'production') {
  app.use(morgan("combined", { stream: accessLogStream }))
} else {
  app.use(morgan('dev', {
    skip: function (req, res) { return res.statusCode < 404 }
  }))
}


// CORS middleware setup
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//  methods: ['GET', 'POST', 'PUT'],
// }))

// Express middleware setup
app.use(express.json())

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

/**
 * Retrieves a small description of what the API does.
 *
 * @returns {Object} - A JSON response containing all of the endpoints available in the API.
 */
app.get("/", (req, res) => {
  res.status(200).json(
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

/**
 * Retrieves just ONE fact stored in the `facts_list` array.
 *
 * @returns {Object} - A JSON response containing one fact.
 */
app.get("/getFact", (req, res) => {
  const randomIndex = Math.floor(Math.random() * facts_list.length)
  const randomFact = facts_list[randomIndex]
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(404).json({ errors: errors.array() })
  }

  res.status(200).json({ fact: `${randomFact}` })
})

/**
 * Retrieves all the facts stored in the `facts_list` array.
 *
 * @returns {Object} - A JSON response containing all the available facts.
 */
app.get("/getAllFacts", (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(404).json({ errors: errors.array() })
  }

  res.status(200).json({ facts: facts_list })
})


/**
 * Adds a new fact to the facts_list array.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.body.fact - The new fact to be added.
 * @returns {Object} - A JSON response with a success message and the added fact.
 */
app.post("/addFact", body('fact')
  .notEmpty().withMessage("Cannot add an empty fact.")
  .isLength({ min: 10 }).withMessage("Fact must be at least 10 characters long."),
  // Route handler
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() })
    }
    const newFact = req.body.fact
    // Validation for the request body

    if (facts_list.includes(newFact)) {
      return res.status(404).json({ error: "Fact already exists." })
    }

    facts_list.push(newFact)
    res.status(200).json({ message: "Fact added successfully.", fact: `${newFact}` })
  }
)

/**
 * Updates a fact from the facts_list array.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.body.fact - The new fact to be updated.
 * @returns {Object} - A JSON response with a success message and the updated fact.
 */
app.put("/updateFact/:index", body('fact')
  .notEmpty().withMessage("Cannot update a non existing fact")
  .isLength({ min: 10 }).withMessage("Fact must be at least 10 characters long"),
  (req, res) => {
    const updatedFact = req.body.fact
    const errors = validationResult(req)
    const factIndex = parseInt(req.params.index)
    const oldFact = facts_list[factIndex]
    const existingFactIndex = facts_list.findIndex((index) => index === updatedFact);

    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() })
    }

    if (existingFactIndex !== -1 && existingFactIndex !== factIndex) {
      return res.status(400).json({ error: "Fact already exists at a different index." });
    }

    facts_list[factIndex] = updatedFact
    res.status(200).json({ message: "Fact successfully updated", updated_fact: `${updatedFact}`, old_fact: `${oldFact}` })
  }
)

/**
 * Deletes a fact from the facts_list array.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.body.fact - The new fact to be deleted.
 * @returns {Object} -  JSON response with a success message and the deleted fact.
 */
app.delete("/deleteFact/:index", body('index')
  .isEmpty().withMessage("Cannot delete a non existing fact"),
  (req, res) => {
    const factIndex = req.params.index
    const errors = validationResult(req)
    const deletedFact = facts_list.splice(factIndex, 1)

    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() })
    }

    if (factIndex < 0 || factIndex >= facts_list.length) {
      return res.status(404).json({ error: "Fact not found." })
    }

    res.status(200).json({ message: "Fact deleted successfully!", fact: deletedFact[0] })
  }
)

/**
 * Turns on the API on the declared port.
 *
 */
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`)
})