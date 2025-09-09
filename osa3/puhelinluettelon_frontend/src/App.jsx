import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ newKeyword, handleKeywordChange }) => {
  return (
    <div>
      filter shown with <input value={newKeyword} onChange={handleKeywordChange} />
    </div>
  )
}

const PersonForm = ({ addName, newName, handleNameChange, newNumber, handleNumberChange }) => {
  return (
  <form onSubmit={addName}>
        <div>
          name: <input value={newName} onChange={handleNameChange}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  )
}

const Persons = ({ persons, deletePerson }) => {
  return (
    <ul>
        {persons.map(person => (
          <li key={person.id}> {person.name} {person.number} <button onClick={() => deletePerson(person.id)}> Delete </button></li>
        )
        )}
      </ul>
  )

}

const Notification = ({ message, type }) => {
    if (message === null) {
      return null
    }

    return (
      <div className={type}>
        {message}
      </div>
    )
  }

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      if (existingPerson.number === newNumber) {
        setNewMessage(`${newName} is already added to phonebook.`)
        setMessageType('error')
        setTimeout(() => setNewMessage(null), 5000)
      } else {
        if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
          const updatedNumber = { ...existingPerson, number: newNumber }
          personService
            .update(existingPerson.id, updatedNumber)
            .then(returnedPerson => {
              setPersons(persons.map(person =>
                person.id !== existingPerson.id ? person : returnedPerson
              ))
              setNewMessage(`Updated ${newName}'s number to ${newNumber}.`)
              setMessageType('success')
              setTimeout(() => setNewMessage(null), 5000)
              setNewName('')
              setNewNumber('')
        })
        .catch(error => {
          setNewMessage(`Information of ${newName} has already been removed from server`)
          setMessageType('error')
          setTimeout(() => setNewMessage(null), 5000)
          setPersons(persons.filter(person => person.id !== existingPerson.id))
        })
        }
      }
    } else {
      const nameObject = {
        name: newName,
        number: newNumber,
      }

      personService
        .create(nameObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewMessage(`Added ${newName}`)
          setMessageType('success')
          setTimeout(() => setNewMessage(null), 5000)
          setNewName('')
          setNewNumber('')
        })
    }
  }
  
  const deletePerson = (id) => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setNewMessage(`Deleted ${person.name}`)
          setMessageType('success')
          setTimeout(() => setNewMessage(null), 5000)
        })
        console.log('deleting id:', id)
    }
  }

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleKeywordChange = (event) => {
    console.log(event.target.value)
    setNewKeyword(event.target.value)
  }

  const numbersToShow = persons.filter(person =>
    person.name.toLowerCase().includes(newKeyword.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={newMessage} type={messageType} />

      <Filter newKeyword={newKeyword} handleKeywordChange={handleKeywordChange}/>

      <h3>Add new number</h3>

      <PersonForm 
        addName={addName} newName={newName} handleNameChange={handleNameChange}
        newNumber={newNumber} handleNumberChange={handleNumberChange} />

      <h2>Numbers</h2>
      
      <Persons persons={numbersToShow} deletePerson={deletePerson}/>
    </div>
  )

} 
export default App