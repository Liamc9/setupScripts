import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Feed, FeedItem, FilterModal } from 'liamc9npm';
import Sort from '../components/search/Sort';

const sampleItems = [
  { title: 'Task 1', description: 'Do this', status: 'completed', priority: 'high', date: '2023-08-20' },
  { title: 'Task 2', description: 'Do that', status: 'pending', priority: 'medium', date: '2023-08-22' },
  { title: 'Task 3', description: 'Another task', status: 'completed', priority: 'low', date: '2023-08-21' },
  { title: 'Task 4', description: 'Yet another task', status: 'inProgress', priority: 'medium', date: '2023-08-23' },
  { title: 'Task 5', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 6', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 7', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 8', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 9', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 10', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 11', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 12', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 13', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 14', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 15', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 16', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 17', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 18', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 19', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 20', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 21', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 22', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 23', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 24', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 25', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 26', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 27', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 28', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 29', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 30', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 31', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 32', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 33', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 34', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 35', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 36', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 37', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 38', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 39', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 40', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 41', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 42', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
  { title: 'Task 43', description: 'Final task', status: 'completed', priority: 'high', date: '2023-08-24' },
];

// Styled components
const SearchViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 0 auto;
  overflow-y: auto;
  max-height: 80vh;
  scrollbar-width: none;
`;

const FilterContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SortContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

/** 
 * A scrollable div container 
 * so we can actually measure scroll distance 
 */
const ScrollableFeedContainer = styled.div`
  width: 100%;
  max-height: 400px;   /* or any height you prefer */
  border: 1px solid #ccc;
`;

export const SearchView = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortedItems, setSortedItems] = useState(sampleItems);

  // 1) Create a ref for the scrollable container
  const containerRef = useRef(null);

  return (
    <SearchViewContainer ref={containerRef}>
      <FilterContainer>
        <FilterModal onChange={setSelectedFilters} />
      </FilterContainer>

      <SortContainer>
        <Sort items={sampleItems} onSortedChange={setSortedItems} />
      </SortContainer>

      {/* 2) Wrap the Feed in the scrollable container */}
      <ScrollableFeedContainer >
        <Feed 
          items={sortedItems} 
          selectedFilters={selectedFilters} 
          infiniteScroll={5}         // loads 5 items at a time
          ItemComponent={FeedItem}
          scrollContainerRef={containerRef} // 3) Pass the ref to Feed
        />
      </ScrollableFeedContainer>
    </SearchViewContainer>
  );
};

export default SearchView;