// Sort.jsx
import React from 'react';
import styled from 'styled-components';
import { SortLogic } from 'liamc9npm';

const SortContainer = styled.div`
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

// Simplified sorting options with labels as values
const sortingOptions = [
  {
    label: 'Sort By',
    comparator: null,
  },
  {
    label: 'Title: A-Z',
    comparator: (a, b) => a.title.localeCompare(b.title),
  },
  {
    label: 'Title: Z-A',
    comparator: (a, b) => b.title.localeCompare(a.title),
  },
  {
    label: 'Date: Newest',
    comparator: (a, b) => new Date(b.date) - new Date(a.date),
  },
  {
    label: 'Date: Oldest',
    comparator: (a, b) => new Date(a.date) - new Date(b.date),
  },
];

const Sort = ({ items, onSortedChange }) => {
  const { updateSort } = SortLogic({ items, onSortedChange });

  return (
    <SortContainer>
      <Select
        onChange={(e) => {
          const selectedOption = sortingOptions.find(
            (option) => option.label === e.target.value
          );
          updateSort(selectedOption?.comparator || null);
        }}
      >
        {sortingOptions.map((option) => (
          <option value={option.label} key={option.label}>
            {option.label}
          </option>
        ))}
      </Select>
    </SortContainer>
  );
};

export default Sort;
