import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'

const anecdotesAtStart = [
  'If it hurts, do it more often',
  'Adding manpower to a late software project makes it later!',
  'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
  'Premature optimization is the root of all evil.',
  'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.'
]

const getId = () => (100000 * Math.random()).toFixed(0)

const asObject = anecdote => {
  return {
    content: anecdote,
    id: getId(),
    votes: 0
  }
}

const initialState = anecdotesAtStart.map(asObject)

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState: [],
  reducers: {
    voteAnecdote(state, action) {
      const id = action.payload
      const anecdoteToVote = state.find(n => n.id === id)
      const votedAnecdote = {
        ...anecdoteToVote,
        votes: anecdoteToVote.votes + 1
      }
      return state.map(anecdote => (anecdote.id !== id ? anecdote : votedAnecdote))
    },
    updateAnecdote(state, action) {
      const updated = action.payload
      return state.map(a => (a.id !== updated.id ? a : updated))
    },
    createAnecdote(state, action) {
      const payload = action.payload
      // accept either a plain string (content) or an object returned by the server
      if (typeof payload === 'string') {
        state.push(asObject(payload))
      } else if (payload && payload.content) {
        state.push({
          content: String(payload.content),
          id: payload.id || getId(),
          votes: Number.isFinite(Number(payload.votes)) ? Number(payload.votes) : 0
        })
      }
    },
    setAnecdotes(state, action) {
      return action.payload
    }
  }
})

const { voteAnecdote, updateAnecdote, createAnecdote, setAnecdotes } = anecdoteSlice.actions

export const initializeAnecdotes = () => {
  return async dispatch => {
    const anecdotes = await anecdoteService.getAll()
    dispatch(setAnecdotes(anecdotes))
  }
} 

export const appendAnecdote = content => {
  return async dispatch => {
    const newAnecdote = await anecdoteService.createNew(content)
    dispatch(createAnecdote(newAnecdote))
  }
}

export const clickAnecdoteVote = id => {
  return async (dispatch, getState) => {
    const anecdote = getState().anecdotes.find(a => a.id === id)
    if (!anecdote) return
    const updated = await anecdoteService.update(id, { ...anecdote, votes: anecdote.votes + 1 })
    dispatch(updateAnecdote(updated))
  }
}

export default anecdoteSlice.reducer
