import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { expect, test, vi } from 'vitest'

test('renders blog title', () => {
  const blog = {
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'https://testurl.com'
  }

  render(<Blog blog={blog} />)

  const element = screen.getByText('Test Blog Title Test Author')
  expect(element).toBeDefined()
})

test('shows url, likes and user when view button is clicked', async () => {
  const blog = {
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'https://testurl.com',
    likes: 5,
    user: {
      name: 'Test User'
    }
  }

  const mockHandler = vi.fn()

  render(
    <Blog blog={blog} updateBlog={mockHandler} deleteBlog={mockHandler} user={{ id: '123', username: 'testuser' }} />
  )

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)
  expect(screen.getByText('https://testurl.com')).toBeDefined()
  expect(screen.getByText('likes 5')).toBeDefined()
  expect(screen.getByText('Test User')).toBeDefined()
})

test('calls the like handler twice when like button is clicked twice', async () => {
  const blog = {
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'https://testurl.com',
    likes: 5,
    user: {
      name: 'Test User'
    }
  }

  const mockHandler = vi.fn()

  render(
    <Blog blog={blog} updateBlog={mockHandler} deleteBlog={mockHandler} user={{ id: '123', username: 'testuser' }} />
  )

  const user = userEvent.setup()
  const button = screen.getByText('like')
  await user.click(button)
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(2)
})
