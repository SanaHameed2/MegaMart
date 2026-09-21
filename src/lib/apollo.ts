// src/lib/apollo.ts
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  defaultDataIdFromObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import { supabase } from './supabase';

// ========== ENV VAR VALIDATION ==========
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    '[apollo.ts] Missing VITE_SUPABASE_URL. Add it to .env.local and restart dev server.'
  );
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    '[apollo.ts] Missing VITE_SUPABASE_ANON_KEY. Add it to .env.local and restart dev server.'
  );
}

// ========== ERROR LINK ==========
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error] Op: ${operation.operationName} | ${message}`,
        { locations, path, code: extensions?.code }
      );
    });
  }
  if (networkError) {
    console.error(
      `[Network error] Op: ${operation.operationName} | ${networkError.message}`,
      networkError
    );
  }
});

// ========== AUTH LINK ==========
const authLink = setContext(async (_, { headers }) => {
  let token = SUPABASE_ANON_KEY;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[apollo authLink] getSession error:', error.message);
    } else if (data?.session?.access_token) {
      token = data.session.access_token;
    }
  } catch (err) {
    console.error('[apollo authLink] Unexpected error:', err);
  }

  return {
    headers: {
      ...headers,
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  };
});

// ========== HTTP LINK ==========
const httpLink = new HttpLink({
  uri: `${SUPABASE_URL}/graphql/v1`,
});

// ========== CACHE ==========
const cache = new InMemoryCache({
  // pg_graphql exposes a global `nodeId` on every row (Relay GOI).
  // Prefer it over `id` so cache refs stay stable across queries.
  dataIdFromObject(responseObject) {
    if ('nodeId' in responseObject && responseObject.nodeId) {
      return `Node:${responseObject.nodeId}`;
    }
    return defaultDataIdFromObject(responseObject);
  },

  // ========== possibleTypes ==========
  possibleTypes: {
    Node: [
      'Products',
      'Categories',
      'ProductImages',
      'Brands',
      'Orders',
      'OrderItems',
      'Carts',
      'CartItems',
      'Reviews',
      'Profiles',
      'Coupons',
      'WishlistItems',
    ],
  },

  // ========== typePolicies ==========
  typePolicies: {
    Query: {
      fields: {
        // ---------- Paginated collections ----------
        productsCollection: relayStylePagination(),
        productImagesCollection: relayStylePagination(),
        ordersCollection: relayStylePagination(),
        orderItemsCollection: relayStylePagination(),
        cartItemsCollection: relayStylePagination(),
        cartsCollection: relayStylePagination(),
        reviewsCollection: relayStylePagination(),
        couponsCollection: relayStylePagination(),
        profilesCollection: relayStylePagination(),
        wishlistItemsCollection: relayStylePagination(),

        // ---------- Filter-sensitive collections ----------
        // ✅ CRITICAL: include `filter` + `orderBy` in the cache key.
        // Without this, Apollo caches the first result of `categoriesCollection`
        // (e.g. category lookup by slug) and reuses it for other queries like
        // `{ parent_id: { is: NULL } }` — causing wrong categories/products
        // to appear across different pages/sections.
        categoriesCollection: {
          keyArgs: ['filter', 'orderBy'],
          merge(_, incoming) {
            return incoming;
          },
        },
        brandsCollection: {
          keyArgs: ['filter', 'orderBy'],
          merge(_, incoming) {
            return incoming;
          },
        },

        // ---------- Node lookup (Relay GOI) ----------
        node: {
          read(_, { args, toReference }) {
            return toReference({
              __typename: 'Node',
              nodeId: args?.nodeId,
            });
          },
        },
      },
    },
  },
});

// ========== CLIENT ==========
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
});