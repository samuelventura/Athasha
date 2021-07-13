import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

test('Has placeholder', () => {
  render(<SearchBar />);
  const searchBox = screen.getByTestId("textbox");
  expect(searchBox.placeholder).toBe("Filter...");
});

test('Has initial value', () => {
  render(<SearchBar filter="Initial filter"/>);
  const searchBox = screen.getByTestId("textbox");
  expect(searchBox.value).toBe("Initial filter");
});

test('Enter key on textbox triggers filter change', () => {
  const handleFilterChange = jest.fn()
  render(<SearchBar onFilterChange={handleFilterChange}/>);
  const searchBox = screen.getByTestId("textbox");
  fireEvent.keyPress(searchBox, { key: 'Enter', code: 'Enter', charCode: 13 });
  expect(handleFilterChange.mock.calls.length).toBe(1);
});

test('Search button click triggers filter change', () => {
  const handleFilterChange = jest.fn()
  render(<SearchBar onFilterChange={handleFilterChange}/>);
  const searchButton = screen.getByTestId("button");
  fireEvent.click(searchButton);
  expect(handleFilterChange.mock.calls.length).toBe(1);
});
