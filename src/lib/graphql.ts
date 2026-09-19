// src/lib/graphql.ts
import { gql } from '@apollo/client';

// ============================================================
// VERIFIED SCHEMA (from Thunder Client tests):
//   - Type name: `products` (lowercase, not Products)
//   - Field names: snake_case (compare_at_price, review_count, sort_order)
//   - brands / categories: flat objects (many-to-one)
//   - product_imagesCollection: Collection pattern (one-to-many)
//   - price, compare_at_price, rating: STRING (Number() needed)
//   - specifications: JSON string (JSON.parse needed)
//   - Filter: use `category_id: { eq: <uuid> }` — NOT nested categories
// ============================================================

export const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCardFields on products {
    id
    nodeId
    name
    slug
    price
    compare_at_price
    stock
    rating
    review_count
    brands {
      id
      name
      slug
    }
    product_imagesCollection(
      orderBy: [{ sort_order: AscNullsLast }]
      first: 5
    ) {
      edges {
        node {
          id
          url
          sort_order
        }
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($filter: productsFilter, $first: Int = 50) {
    productsCollection(filter: $filter, first: $first) {
      edges {
        node {
          ...ProductCardFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query GetProductBySlug($slug: String!) {
    productsCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          ...ProductCardFields
          description
          sku
          specifications
          category_id
          categories {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categoriesCollection(orderBy: [{ sort_order: AscNullsLast }]) {
      edges {
        node {
          id
          nodeId
          name
          slug
          parent_id
          sort_order
        }
      }
    }
  }
`;

// ✅ Category lookup by slug — needed for category-based product filtering
export const GET_CATEGORY_ID_BY_SLUG = gql`
  query GetCategoryIdBySlug($slug: String!) {
    categoriesCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_BRANDS = gql`
  query GetBrands {
    brandsCollection {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
`;