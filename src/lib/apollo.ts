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
      // TODO: toast.error(message);
    });
  }
  if (networkError) {
    console.error(
      `[Network error] Op: ${operation.operationName} | ${networkError.message}`,
      networkError
    );
    // TODO: toast.error('Network issue — check your connection.');
  }
});

// ========== AUTH LINK (with try/catch fallback) ==========
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

  // ========== possibleTypes (TOP-LEVEL sibling of typePolicies) ==========
  // pg_graphql returns most entities behind the `Node` interface.
  // Declaring its implementations lets Apollo resolve refs across types
  // (e.g. a Review pointing to a Product stored under `Node:<nodeId>`).
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
        // pg_graphql names collection fields `<table>Collection`.
        // Every paginated list below merges pages instead of overwriting.
        productsCollection: relayStylePagination(),
        categoriesCollection: relayStylePagination(),
        productImagesCollection: relayStylePagination(),
        ordersCollection: relayStylePagination(),
        orderItemsCollection: relayStylePagination(),
        cartItemsCollection: relayStylePagination(),
        cartsCollection: relayStylePagination(),
        reviewsCollection: relayStylePagination(),
        brandsCollection: relayStylePagination(),
        couponsCollection: relayStylePagination(),
        profilesCollection: relayStylePagination(),
        wishlistItemsCollection: relayStylePagination(),

        // ✅ Verified via Thunder Client: `node(nodeId: ID!)` exists and returns
        // a Relay Global Object. This shortcut tells Apollo to resolve the
        // reference from cache (by nodeId) instead of hitting the network
        // every time a node() query runs — as long as the object is already
        // cached from an earlier collection query.
        node: {
          read(_, { args, toReference }) {
            return toReference({
              __typename: 'Node',
              nodeId: args?.nodeId,
            });
          },
        },

        // NOTE: pg_graphql does NOT generate PostGraphile-style single-item
        // fields like `productBySlug(slug: "...")` or `cartByUser(userId: ...)`.
        // Confirmed via Thunder Client — those return
        //   "Unknown field \"productBySlug\" on type Query".
        // Single-item lookups must go through `<table>Collection(filter: {...})`.
      },
    },
  },
});

// ========== CLIENT ==========
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
});