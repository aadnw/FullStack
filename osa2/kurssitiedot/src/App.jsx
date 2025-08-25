import Content from './components/Content'

const App = ({ courses }) => {
  return (
    <div>
      <h1>Web development curriculum</h1>
      {courses.map(course =>
        <Content key={course.id} course={course} />
      )}
    </div>
  )
}

export default App