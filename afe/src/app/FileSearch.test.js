import { render, screen, fireEvent } from '@testing-library/react'
import FileSearch from './FileSearch'

test('Has placeholder', () => {
  render(<FileSearch />)
  const searchBox = screen.getByTestId("textbox")
  expect(searchBox.placeholder).toBe("Filter...")
})

test('Has initial value', () => {
  render(<FileSearch filter="Initial filter"/>)
  const searchBox = screen.getByTestId("textbox")
  expect(searchBox.value).toBe("Initial filter")
})

test('Enter key on textbox triggers filter change', () => {
  const handleFilterChange = jest.fn()
  render(<FileSearch onFilterChange={handleFilterChange}/>)
  const searchBox = screen.getByTestId("textbox")
  fireEvent.keyPress(searchBox, { key: 'Enter', code: 'Enter', charCode: 13 })
  expect(handleFilterChange.mock.calls.length).toBe(1)
})

test('Search button click triggers filter change', () => {
  const handleFilterChange = jest.fn()
  render(<FileSearch onFilterChange={handleFilterChange}/>)
  const searchButton = screen.getByTestId("button")
  fireEvent.click(searchButton)
  expect(handleFilterChange.mock.calls.length).toBe(1)
})
