const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

app.use(morgan('tiny'))

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39445323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "1243234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39236423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`Phonebook has info for ${persons.length} people <br> ${new Date()}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
    response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons= persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const min = 0
    const max = 10000000000
    return String(Math.floor(Math.random()*(max - min)+min))
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    console.log('POST request body:', body)

    if (!body.name) {
        return response.status(400).json({
            error: "name missing"
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: "number missing"
        })
    }

    const existingName = persons.find(person => person.name === body.name)

    if (existingName) {
        return response.status(400).json({
            error: "name must be unique"
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
    })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})