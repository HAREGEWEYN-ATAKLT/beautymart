// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";

// type Category = {
//   categoryId: string;
//   categoryName: string;
//   description: string | null;
//   createdAt: string;

//   store: {
//     storeId: string;
//     storeName: string;
//     status: string;
//   };

//   productCount: number;
// };

// type CategoryResponse = {
//   statistics: {
//     totalCategories: number;
//     totalProducts: number;
//     activeStores: number;
//   };

//   categories: Category[];
// };

// export default function AdminCategoriesPage() {
//   const [data, setData] = useState<CategoryResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadCategories() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch("/api/admin/categories");

//         const result = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             result.message || "Failed to load categories"
//           );
//         }

//         setData(result);
//       } catch (err) {
//         console.error("Categories error:", err);

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Failed to load categories"
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadCategories();
//   }, []);

//   if (loading) {
//     return (
//       <div className="admin-page">
//         <div className="admin-categories-loading">
//           <div className="admin-loading-spinner" />
//           <p>Loading categories...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !data) {
//     return (
//       <div className="admin-page">
//         <div className="admin-categories-error">
//           <div className="admin-error-icon">!</div>

//           <h2>Unable to load categories</h2>

//           <p>
//             {error || "Something went wrong while loading categories."}
//           </p>

//           <button
//             type="button"
//             onClick={() => window.location.reload()}
//             className="admin-category-retry-button"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="admin-page admin-categories-page">
//       {/* Page header */}
//       <div className="admin-categories-header">
//         <div>
//           <div className="admin-products-eyebrow">
//             MARKETPLACE MANAGEMENT
//           </div>

//           <h1>Categories</h1>

//           <p>
//             Manage product categories across all BeautyMart stores.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="admin-category-add-button"
//           disabled
//           title="Category creation will be added next"
//         >
//           + Add Category
//         </button>
//       </div>

//       {/* Statistics */}
//       <div className="admin-category-stat-grid">
//         <div className="admin-category-stat-card">
//           <div className="admin-category-stat-icon">◈</div>

//           <div>
//             <span>Total Categories</span>
//             <strong>{data.statistics.totalCategories}</strong>
//           </div>
//         </div>

//         <div className="admin-category-stat-card">
//           <div className="admin-category-stat-icon">◇</div>

//           <div>
//             <span>Products Assigned</span>
//             <strong>{data.statistics.totalProducts}</strong>
//           </div>
//         </div>

//         <div className="admin-category-stat-card">
//           <div className="admin-category-stat-icon">⌂</div>

//           <div>
//             <span>Active Stores</span>
//             <strong>{data.statistics.activeStores}</strong>
//           </div>
//         </div>
//       </div>

//       {/* Categories table */}
//       <section className="admin-category-table-card">
//         <div className="admin-category-table-header">
//           <div>
//             <span className="admin-products-eyebrow">
//               CATEGORY DIRECTORY
//             </span>

//             <h2>All Categories</h2>
//           </div>

//           <span className="admin-category-count">
//             {data.categories.length} categories
//           </span>
//         </div>

//         {data.categories.length === 0 ? (
//           <div className="admin-category-empty">
//             <div className="admin-category-empty-icon">
//               ◈
//             </div>

//             <h3>No categories yet</h3>

//             <p>
//               Categories created by stores will appear here.
//             </p>
//           </div>
//         ) : (
//           <div className="admin-category-table-wrapper">
//             <table className="admin-category-table">
//               <thead>
//                 <tr>
//                   <th>Category</th>
//                   <th>Store</th>
//                   <th>Products</th>
//                   <th>Store Status</th>
//                   <th>Created</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {data.categories.map((category) => {
//                   const formattedDate = new Date(
//                     category.createdAt
//                   ).toLocaleDateString("en-US", {
//                     month: "short",
//                     day: "numeric",
//                     year: "numeric",
//                   });

//                   return (
//                     <tr key={category.categoryId}>
//                       <td>
//                         <div className="admin-category-name-cell">
//                           <div className="admin-category-icon">
//                             ◈
//                           </div>

//                           <div>
//                             <strong>
//                               {category.categoryName}
//                             </strong>

//                             <span>
//                               {category.description ||
//                                 "No description provided"}
//                             </span>
//                           </div>
//                         </div>
//                       </td>

//                       <td>
//                         <div className="admin-category-store">
//                           <strong>
//                             {category.store.storeName}
//                           </strong>

//                           <span>
//                             {category.store.storeId}
//                           </span>
//                         </div>
//                       </td>

//                       <td>
//                         <span className="admin-category-product-count">
//                           {category.productCount}
//                         </span>
//                       </td>

//                       <td>
//                         <span
//                           className={`admin-category-store-status ${
//                             category.store.status.toLowerCase()
//                           }`}
//                         >
//                           <span />
//                           {category.store.status}
//                         </span>
//                       </td>

//                       <td>
//                         <span className="admin-category-date">
//                           {formattedDate}
//                         </span>
//                       </td>

//                       <td>
//                         <Link
//                           href={`/admin/categories/${category.categoryId}`}
//                           className="admin-category-view-button"
//                         >
//                           View →
//                         </Link>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = {
  categoryId: string;
  categoryName: string;
  description: string | null;
  createdAt: string;

  store: {
    storeId: string;
    storeName: string;
    status: string;
  };

  productCount: number;
};

type CategoryResponse = {
  statistics: {
    totalCategories: number;
    totalProducts: number;
    activeStores: number;
  };

  categories: Category[];
};

export default function AdminCategoriesPage() {
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [storeFilter, setStoreFilter] = useState("All Stores");

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/categories");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load categories"
          );
        }

        setData(result);
      } catch (err) {
        console.error("Categories error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const categoryNames = useMemo(() => {
    if (!data) return [];

    return Array.from(
      new Set(data.categories.map((category) => category.categoryName))
    ).sort();
  }, [data]);

  const filteredCategories = useMemo(() => {
    if (!data) return [];

    const searchValue = search.trim().toLowerCase();

    return data.categories.filter((category) => {
      const matchesSearch =
        !searchValue ||
        category.categoryName.toLowerCase().includes(searchValue) ||
        category.store.storeName.toLowerCase().includes(searchValue) ||
        category.store.storeId.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        category.categoryName === categoryFilter;

      const matchesStore =
        storeFilter === "All Stores" ||
        (storeFilter === "Active Stores" &&
          category.store.status === "ACTIVE") ||
        (storeFilter === "Inactive Stores" &&
          category.store.status === "INACTIVE") ||
        (storeFilter === "Suspended Stores" &&
          category.store.status === "SUSPENDED");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStore
      );
    });
  }, [data, search, categoryFilter, storeFilter]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-categories-loading">
          <div className="admin-loading-spinner" />
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-page">
        <div className="admin-categories-error">
          <div className="admin-error-icon">!</div>

          <h2>Unable to load categories</h2>

          <p>
            {error ||
              "Something went wrong while loading categories."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="admin-category-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-categories-page">
      {/* Page Header */}
      <div className="admin-categories-header">
        <div>
          <div className="admin-products-eyebrow">
            MARKETPLACE MANAGEMENT
          </div>

        

          <p>
            Monitor product categories across all BeautyMart stores.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-category-stat-grid">
        <div className="admin-category-stat-card">
          <div className="admin-category-stat-icon">◈</div>

          <div>
            <span>Total Categories</span>
            <strong>{data.statistics.totalCategories}</strong>
          </div>
        </div>

        <div className="admin-category-stat-card">
          <div className="admin-category-stat-icon">◇</div>

          <div>
            <span>Products Assigned</span>
            <strong>{data.statistics.totalProducts}</strong>
          </div>
        </div>

        <div className="admin-category-stat-card">
          <div className="admin-category-stat-icon">⌂</div>

          <div>
            <span>Active Stores</span>
            <strong>{data.statistics.activeStores}</strong>
          </div>
        </div>
      </div>

      {/* Directory */}
      <section className="admin-category-table-card">
        <div className="admin-category-table-header">
          <div>
            <span className="admin-products-eyebrow">
              CATEGORY DIRECTORY
            </span>

            <h2>All Categories</h2>
          </div>

          <span className="admin-category-count">
            {filteredCategories.length}{" "}
            {filteredCategories.length === 1
              ? "category"
              : "categories"}{" "}
            shown
          </span>
        </div>

        {/* Filters */}
        <div className="admin-category-filters">
          <div className="admin-category-search">
            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search category or store..."
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="admin-category-filter-select"
          >
            <option value="All Categories">
              All Categories
            </option>

            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={storeFilter}
            onChange={(event) =>
              setStoreFilter(event.target.value)
            }
            className="admin-category-filter-select"
          >
            <option value="All Stores">
              All Stores
            </option>

            <option value="Active Stores">
              Active Stores
            </option>

            <option value="Inactive Stores">
              Inactive Stores
            </option>

            <option value="Suspended Stores">
              Suspended Stores
            </option>
          </select>
        </div>

        {/* Filter Summary */}
        <div className="admin-category-filter-summary">
          <span>
            <strong>{filteredCategories.length}</strong>{" "}
            categories shown
          </span>

          {(search ||
            categoryFilter !== "All Categories" ||
            storeFilter !== "All Stores") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All Categories");
                setStoreFilter("All Stores");
              }}
              className="admin-category-clear-filters"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="admin-category-empty">
            <div className="admin-category-empty-icon">
              ◈
            </div>

            <h3>No categories found</h3>

            <p>
              Try changing your search or filter selection.
            </p>
          </div>
        ) : (
          <div className="admin-category-table-wrapper">
            <table className="admin-category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Store</th>
                  <th>Products</th>
                  <th>Store Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => {
                  const formattedDate = new Date(
                    category.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={category.categoryId}>
                      <td>
                        <div className="admin-category-name-cell">
                          <div className="admin-category-icon">
                            ◈
                          </div>

                          <div>
                            <strong>
                              {category.categoryName}
                            </strong>

                            <span>
                              {category.description ||
                                "No description provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-category-store">
                          <strong>
                            {category.store.storeName}
                          </strong>

                          <span>
                            {category.store.storeId}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-product-count">
                          {category.productCount}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-category-store-status ${
                            category.store.status.toLowerCase()
                          }`}
                        >
                          <span />
                          {category.store.status}
                        </span>
                      </td>

                      <td>
                        <span className="admin-category-date">
                          {formattedDate}
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/admin/categories/${category.categoryId}`}
                          className="admin-category-view-button"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
