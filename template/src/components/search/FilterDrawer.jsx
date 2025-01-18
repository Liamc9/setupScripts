// src/components/FilterDrawer.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { BottomDrawer, FilterLogic, RangeSlider, SelectInput } from 'liamc9npm';

import { FilterIcon } from 'liamc9npm';

// Styled components for button and filter layout
const Button = styled.button`
  display: flex;
  flex-direction: row;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .svg {
    margin-right: 0.5rem;
    width: 24px;
    height: 24px;
    align-self: center;
  }

`;

const FilterContainer = styled.div`
  display: grid;
  gap: 2rem;
  padding: 1rem;
`;

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const GroupLabel = styled.h5`
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

const FilterDrawer = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDrawer = () => setIsOpen(true);
  const handleCloseDrawer = () => setIsOpen(false);

  return (
    <>
      <Button onClick={handleOpenDrawer}><FilterIcon className='svg'/> Filters</Button>
      <BottomDrawer isOpen={isOpen} onClose={handleCloseDrawer}>
        <FilterLogic
          filters={Object.values(filtersConfig)}
          onChange={selectedFilters => {
            if (onChange) {
              onChange(selectedFilters);
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
      </BottomDrawer>
    </>
  );
};

export default FilterDrawer;
