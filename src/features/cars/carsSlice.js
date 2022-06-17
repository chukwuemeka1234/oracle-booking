/* eslint-disable import/prefer-default-export */
import {
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import apiSlice from '../api/apiSlice';

const carsAdapter = createEntityAdapter({
  selectId: (car) => car.id,
  sortComparer: (a, b) => b.date.localCompare(a.date),
});

const initialState = carsAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCars: builder.query({
      query: () => '/cars',
      transformResponse: (responseData) => {
        const [loadedCars] = responseData;
        return carsAdapter.setAll(initialState, loadedCars); // Normalise data
      },
      providesTags: (result) => [
        { type: 'Cars', id: 'LIST_CARS' },
        ...result.ids.map((id) => ({ type: 'Cars', id })), // Provide an object for each car in the list
      ],
    }),
    getMyFavorites: builder.query({
      query: () => '/my_favorites',
      transformResponse: (responseData) => {
        const [loadedFavorites] = responseData;
        return carsAdapter.setAll(initialState, loadedFavorites); // Normalise data
      },
      providesTags: (result) => [
        { type: 'Favorites', id: 'LIST_FAVORITES' },
        ...result.ids.map((id) => ({ type: 'Favorites', id })), // Provide an object for each car in the list
      ],
    }),
  }),
});

export const {
  useGetCarsQuery,
} = extendedApiSlice;

// returns the query result object
export const selectCarsResults = extendedApiSlice.endpoints.getCars.select();

// create memoized selectors
const selectCarsData = createSelector(
  selectCarsResults,
  (result) => result.data, // Normalized state object with ids as keys & entities as values
);

// Create and rename selectors using destructuring
export const {
  selectIds: selectCarIds,
  selectAll: selectAllCars,
  selectById: selectCarById,
  selectId: selectCarId,
} = carsAdapter.getSelectors((state) => selectCarsData(state) ?? initialState);
