// ../../components/search/Feed.jsx
import React from 'react';
import styled from 'styled-components';
import { FeedItem, FeedLogic } from 'liamc9npm';

// ---------------------- Styled Components ----------------------
const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: none;
  background-color: ${({ active }) => (active ? '#007bff' : '#e0e0e0')};
  color: ${({ active }) => (active ? '#fff' : '#000')};
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ active }) => (active ? '#0056b3' : '#ccc')};
  }
`;

const LoadMoreButton = styled.button`
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
`;

// ---------------------- Feed Component ----------------------
const Feed = ({
  items = [],
  sortBy,
  selectedFilters = {},
  ItemComponent = FeedItem,
  pagination,         // optional number of items per page
  loadMore,           // optional number of items to load per click
  infiniteScroll,     // optional number of items to load on bottom scroll
  scrollContainerRef  // optional container ref for infinite scrolling
}) => {

  // -- 1) Retrieve all the logic from FeedLogic
  const {
    itemsToRender,
    pages,
    currentPage,
    setCurrentPage,
    hasMoreItems,
    handleLoadMore
  } = FeedLogic({
    items,
    sortBy,
    selectedFilters,
    pagination,
    loadMore,
    infiniteScroll,
    scrollContainerRef
  });

  // -- 2) Render
  return (
    <FeedContainer>
      {itemsToRender.map((item, index) => (
        <ItemComponent key={index} data={item} />
      ))}

      {/* Pagination controls (if pagination is used) */}
      {pages?.length > 1 && (
        <PaginationContainer>
          {pages.map((page) => (
            <PageButton
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PageButton>
          ))}
        </PaginationContainer>
      )}

      {/* Load-more button (if loadMore is used) */}
      {loadMore && hasMoreItems && (
        <LoadMoreButton onClick={handleLoadMore}>
          Load More
        </LoadMoreButton>
      )}
    </FeedContainer>
  );
};

export default Feed;
