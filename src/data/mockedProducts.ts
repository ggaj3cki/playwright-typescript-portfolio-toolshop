// Mirrors the pagination shape of an empty products response from the live API.
export const emptyProductsPage = {
  current_page: 1,
  data: [],
  from: null,
  last_page: 1,
  per_page: 9,
  to: null,
  total: 0,
} as const;
