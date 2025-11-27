import { useSelector, useDispatch } from 'react-redux'
import { clickAnecdoteVote } from '../reducers/anecdoteReducer'
import { showNotification } from '../reducers/notificationReducer'

const AnecdoteList = () => {
  const anecdotes = useSelector(state => state.anecdotes)
  const filter = useSelector(state => state.filter)

  // defensive filtering: coerce values to strings so malformed items don't crash
  const q = String(filter || '').toLowerCase()
  const filtered = (anecdotes || []).filter(a => String((a && a.content) || '').toLowerCase().includes(q))

  const dispatch = useDispatch()
    
    const vote = id => {
        const anecdote = anecdotes.find(a => a.id === id)
        dispatch(clickAnecdoteVote(id))
        if (anecdote) {
          dispatch(showNotification(`you voted '${anecdote.content}'`, 5))
        }
    }
    
    return (
      filtered
        .slice()
        .sort((a, b) => (Number(b && b.votes) || 0) - (Number(a && a.votes) || 0))
        .map((anecdote, i) => (
          <div key={(anecdote && anecdote.id) || i}>
            <div>{String((anecdote && anecdote.content) || '')}</div>
            <div>
              has {String((anecdote && anecdote.votes) || 0)}
              <button onClick={() => vote(anecdote && anecdote.id)}>vote</button>
            </div>
          </div>
        ))
    )
}

export default AnecdoteList