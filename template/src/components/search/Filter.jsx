// Filter.jsx
import React from 'react';
import { RangeSlider, FilterLogic, SelectInput } from 'liamc9npm';  // Adjust import paths as needed
import styled from 'styled-components';

export const FilterContainer = styled.div`
  display: grid;
  gap: 2rem;
`;

export const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GroupLabel = styled.h5`
  margin-bottom: 0.5rem;
`;

// Define filter configurations explicitly
const filtersConfig = {
  status: {
    category: 'status',
    label: 'Status',
    type: 'dropdown',
    options: [
      { value: 'completed', label: 'Completed', initial: false },
      { value: 'pending', label: 'Pending', initial: false },
      { value: 'inProgress', label: 'In Progress', initial: false },
    ],
  },
  priority: {
    category: 'priority',
    label: 'Priority',
    type: 'range',
    options: [
      { value: 'high', label: 'High', initial: false },
      { value: 'medium', label: 'Medium', initial: false },
      { value: 'low', label: 'Low', initial: false },
    ],
  },
};

const Filter = ({ onChange }) => (
  <FilterLogic
    filters={Object.values(filtersConfig)}
    onChange={selectedFilters => {
      if (onChange) {
        onChange(selectedFilters); // Pass the selectedFilters up to the parent
      }
    }}
  >
    {({ selectedFilters, setSelection }) => {
      const statusFilter = filtersConfig.status;
      const priorityFilter = filtersConfig.priority;

      return (
        <FilterContainer>
          {/* Status Dropdown */}
          <GroupContainer>
            <GroupLabel>{statusFilter.label}</GroupLabel>
            <SelectInput
              name={statusFilter.category}
              label={`Select ${statusFilter.label}`}
              value={
                selectedFilters[statusFilter.category] &&
                selectedFilters[statusFilter.category][0]
                  ? selectedFilters[statusFilter.category][0]
                  : ''
              }
              onChange={(e) =>
                setSelection(statusFilter.category, e.target.value)
              }
              options={statusFilter.options}
              color="#000"
            />
          </GroupContainer>

          {/* Priority Range Slider */}
          <GroupContainer>
            <GroupLabel>{priorityFilter.label}</GroupLabel>
            <RangeSlider
              min={0}
              max={priorityFilter.options.length - 1}
              label={priorityFilter.label}
              onChange={(index) => {
                const value = priorityFilter.options[index]?.value;
                if (value) setSelection(priorityFilter.category, value);
              }}
            />
          </GroupContainer>
        </FilterContainer>
      );
    }}
  </FilterLogic>
);

export default Filter;
