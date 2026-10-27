// "use client";

// import Link from "next/link";
// import { useCallback, useEffect, useState } from "react";
// import "./categories.css";
// type Category = {
//   categoryId: string;
//   categoryName: string;
//   description: string | null;
//   createdAt: string;
//   productCount: number;
// };

// export default function StoreOwnerCategoriesPage() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryName, setCategoryName] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState<"success" | "error">(
//     "success"
//   );

//   const loadCategories = useCallback(async () => {
//     try {
//       const response = await fetch("/api/store-owner/categories");
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to load categories.");
//       }

//       setCategories(data.categories ?? []);
//     } catch (error) {
//       setMessage(
//         error instanceof Error
//           ? error.message
//           : "Failed to load categories."
//       );
//       setMessageType("error");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void loadCategories();
//   }, [loadCategories]);

//   async function handleCreateCategory(
//     event: React.FormEvent<HTMLFormElement>
//   ) {
//     event.preventDefault();
//     setMessage("");

//     const trimmedName = categoryName.trim();
//     const trimmedDescription = description.trim();

//     if (!trimmedName) {
//       setMessage("Please enter a category name.");
//       setMessageType("error");
//       return;
//     }

//     setCreating(true);

//     try {
//       const response = await fetch("/api/store-owner/categories", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           categoryName: trimmedName,
//           description: trimmedDescription,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to create category.");
//       }

//       setMessage("Category created successfully.");
//       setMessageType("success");
//       setCategoryName("");
//       setDescription("");

//       await loadCategories();
//     } catch (error) {
//       setMessage(
//         error instanceof Error
//           ? error.message
//           : "Failed to create category."
//       );
//       setMessageType("error");
//     } finally {
//       setCreating(false);
//     }
//   }

//   return (
//    <div className="categories-page">
//       {/* Page heading */}
//       <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
//             <Link
//               href="/store-owner"
//               className="transition hover:text-[#8b4b5a]"
//             >
//               Dashboard
//             </Link>
//             <span>/</span>
//             <span className="text-gray-700">Categories</span>
//           </div>

//           <h1 className="text-2xl font-bold tracking-tight text-[#2d282b] sm:text-3xl">
//             Categories
//           </h1>

//           <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
//             Organize your beauty products into clear categories so customers
//             can find what they need more easily.
//           </p>
//         </div>

//         <Link
//           href="/store-owner/products"
//           className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#8b4b5a]/40 hover:text-[#8b4b5a]"
//         >
//           <span aria-hidden="true">←</span>
//           Back to Products
//         </Link>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <p className="text-sm font-medium text-gray-500">
//                 Total Categories
//               </p>
//               <p className="mt-2 text-3xl font-bold tracking-tight text-[#2d282b]">
//                 {loading ? "—" : categories.length}
//               </p>
//             </div>
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8b4b5a]/10 text-xl text-[#8b4b5a]">
//               ◇
//             </div>
//           </div>
//           <p className="mt-3 text-xs text-gray-500">
//             Categories created for your store
//           </p>
//         </div>

//         <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <p className="text-sm font-medium text-gray-500">
//                 Products Categorized
//               </p>
//               <p className="mt-2 text-3xl font-bold tracking-tight text-[#2d282b]">
//                 {loading
//                   ? "—"
//                   : categories.reduce(
//                       (total, category) => total + category.productCount,
//                       0
//                     )}
//               </p>
//             </div>
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
//               ✓
//             </div>
//           </div>
//           <p className="mt-3 text-xs text-gray-500">
//             Products assigned to your categories
//           </p>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
//         {/* Create category */}
//         <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b4b5a]/10 text-lg text-[#8b4b5a]">
//                 +
//               </div>
//               <div>
//                 <h2 className="font-semibold text-[#2d282b]">
//                   Create a Category
//                 </h2>
//                 <p className="mt-1 text-xs text-gray-500">
//                   Add a category to organize your inventory.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleCreateCategory} className="space-y-5 p-5 sm:p-6">
//             <div>
//               <label
//                 htmlFor="categoryName"
//                 className="mb-2 block text-sm font-medium text-gray-700"
//               >
//                 Category Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 id="categoryName"
//                 name="categoryName"
//                 type="text"
//                 value={categoryName}
//                 onChange={(event) => setCategoryName(event.target.value)}
//                 placeholder="e.g. Skincare"
//                 maxLength={80}
//                 required
//                 disabled={creating}
//                 className="min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#8b4b5a] focus:ring-4 focus:ring-[#8b4b5a]/10 disabled:bg-gray-50"
//               />
//               <p className="mt-1.5 text-xs text-gray-400">
//                 Maximum 80 characters.
//               </p>
//             </div>

//             <div>
//               <label
//                 htmlFor="description"
//                 className="mb-2 block text-sm font-medium text-gray-700"
//               >
//                 Description <span className="font-normal text-gray-400">(optional)</span>
//               </label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={description}
//                 onChange={(event) => setDescription(event.target.value)}
//                 placeholder="Describe the products in this category..."
//                 rows={4}
//                 maxLength={500}
//                 disabled={creating}
//                 className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#8b4b5a] focus:ring-4 focus:ring-[#8b4b5a]/10 disabled:bg-gray-50"
//               />
//             </div>

//             {message && (
//               <div
//                 role="status"
//                 aria-live="polite"
//                 className={`rounded-xl border px-4 py-3 text-sm ${
//                   messageType === "success"
//                     ? "border-emerald-200 bg-emerald-50 text-emerald-800"
//                     : "border-red-200 bg-red-50 text-red-700"
//                 }`}
//               >
//                 {message}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={creating || !categoryName.trim()}
//               className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#8b4b5a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#743d4a] focus:outline-none focus:ring-4 focus:ring-[#8b4b5a]/20 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {creating ? (
//                 <>
//                   <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                   Creating Category...
//                 </>
//               ) : (
//                 "Create Category"
//               )}
//             </button>
//           </form>
//         </section>

//         {/* Category list */}
//         <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
//             <div>
//               <h2 className="font-semibold text-[#2d282b]">
//                 Your Categories
//               </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 {loading
//                   ? "Loading your categories..."
//                   : `${categories.length} ${
//                       categories.length === 1 ? "category" : "categories"
//                     } in your store`}
//               </p>
//             </div>

//             <Link
//               href="/store-owner/products/add"
//               className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#8b4b5a]/20 bg-[#8b4b5a]/5 px-3.5 py-2 text-sm font-semibold text-[#8b4b5a] transition hover:bg-[#8b4b5a]/10 sm:self-auto"
//             >
//               <span aria-hidden="true">+</span>
//               Add Product
//             </Link>
//           </div>

//           <div className="p-4 sm:p-6">
//             {loading ? (
//               <div className="space-y-3">
//                 {[1, 2].map((item) => (
//                   <div
//                     key={item}
//                     className="h-24 animate-pulse rounded-xl border border-gray-100 bg-gray-50"
//                   />
//                 ))}
//               </div>
//             ) : categories.length === 0 ? (
//               <div className="flex flex-col items-center px-5 py-12 text-center">
//                 <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8b4b5a]/10 text-2xl text-[#8b4b5a]">
//                   ◇
//                 </div>
//                 <h3 className="font-semibold text-[#2d282b]">
//                   No categories yet
//                 </h3>
//                 <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
//                   Create your first category to keep your products organized.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 {categories.map((category, index) => (
//                   <article
//                     key={category.categoryId}
//                     className="group min-w-0 rounded-xl border border-gray-200 p-4 transition hover:border-[#8b4b5a]/30 hover:shadow-sm sm:p-5"
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8f5f0] text-lg font-semibold text-[#8b4b5a]">
//                         {category.categoryName.charAt(0).toUpperCase()}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <h3 className="break-words font-semibold text-[#2d282b]">
//                           {category.categoryName}
//                         </h3>
//                         <p className="mt-1 break-words text-sm leading-5 text-gray-500">
//                           {category.description || "No description provided"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
//                       <span className="text-xs text-gray-400">
//                         Category {String(index + 1).padStart(2, "0")}
//                       </span>
//                       <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
//                         <span className="h-1.5 w-1.5 rounded-full bg-[#8b4b5a]" />
//                         {category.productCount}{" "}
//                         {category.productCount === 1 ? "product" : "products"}
//                       </span>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
  
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import "./categories.css";

type Category = {
  categoryId: string;
  categoryName: string;
  description: string | null;
  createdAt: string;
  productCount: number;
};

export default function StoreOwnerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/store-owner/categories");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load categories.");

      setCategories(data.categories ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load categories.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setCreating(true);

    try {
      const response = await fetch("/api/store-owner/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: categoryName.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to create category.");

      setMessage("Category created successfully.");
      setMessageType("success");
      setCategoryName("");
      setDescription("");
      await loadCategories();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create category.");
      setMessageType("error");
    } finally {
      setCreating(false);
    }
  }

  const productTotal = categories.reduce((sum, category) => sum + category.productCount, 0);

  return (
    <div className="categories-page">
      <div className="category-header">
        <div>
          <div className="category-breadcrumb">
            <Link href="/store-owner">Dashboard</Link> <span>/</span> Categories
          </div>
          <h1>Categories</h1>
          <p className="category-description">
            Manage and organize your store inventory so customers can discover
            your beauty products easily.
          </p>
        </div>

        <Link href="/store-owner/products" className="category-button category-button-secondary">
          ← Back to Products
        </Link>
      </div>

      <div className="category-stats">
        <div className="category-stat">
          <div>
            <p className="category-stat-label">Total categories</p>
            <p className="category-stat-value">{loading ? "—" : String(categories.length).padStart(2, "0")}</p>
            <p className="category-stat-note">Organized collections</p>
          </div>
          <div className="category-stat-icon" aria-hidden="true">▱</div>
        </div>

        <div className="category-stat">
          <div>
            <p className="category-stat-label">Products categorized</p>
            <p className="category-stat-value">{loading ? "—" : String(productTotal).padStart(2, "0")}</p>
            <p className="category-stat-note">Products assigned to categories</p>
          </div>
          <div className="category-stat-icon category-stat-icon-green" aria-hidden="true">◇</div>
        </div>
      </div>

      <div className="category-content">
        <section className="category-panel">
          <div className="category-panel-header category-create-heading">
            <div className="category-heading-icon" aria-hidden="true">+</div>
            <div>
              <h2>Create a category</h2>
              <p>Add a new category for your products.</p>
            </div>
          </div>

          <form className="category-form" onSubmit={handleCreateCategory}>
            <div className="category-field">
              <label htmlFor="categoryName">Category name <span>*</span></label>
              <input
                id="categoryName"
                name="categoryName"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="e.g. Skincare"
                maxLength={80}
                required
                disabled={creating}
              />
              <small>Maximum 80 characters.</small>
            </div>

            <div className="category-field">
              <label htmlFor="categoryDescription">Description <span className="category-optional">(optional)</span></label>
              <textarea
                id="categoryDescription"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the products in this category..."
                rows={4}
                maxLength={500}
                disabled={creating}
              />
            </div>

            {message && (
              <div
                className={`category-notice ${messageType === "success" ? "category-notice-success" : "category-notice-error"}`}
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <button className="category-submit" type="submit" disabled={creating || !categoryName.trim()}>
              {creating ? "Creating category..." : "+  Create Category"}
            </button>
          </form>
        </section>

        <section className="category-panel">
          <div className="category-panel-header category-list-heading">
            <div className="category-list-title">
              <div className="category-heading-icon category-heading-icon-soft" aria-hidden="true">▦</div>
              <div>
                <h2>Your categories</h2>
                <p>{loading ? "Loading categories..." : `${categories.length} ${categories.length === 1 ? "category" : "categories"} in your store`}</p>
              </div>
            </div>

            <Link href="/store-owner/products/add" className="category-button category-button-add">
              + Add Product
            </Link>
          </div>

          {loading ? (
            <div className="category-empty">Loading your categories...</div>
          ) : categories.length === 0 ? (
            <div className="category-empty">
              <div className="category-empty-icon">▦</div>
              <h3>No categories yet</h3>
              <p>Create your first category using the form to get started.</p>
            </div>
          ) : (
            <div className="category-list">
              {categories.map((category, index) => (
                <article className="category-card" key={category.categoryId}>
                  <div className="category-card-top">
                    <div className="category-card-icon" aria-hidden="true">
                      {category.categoryName.charAt(0).toUpperCase()}
                    </div>
                    <div className="category-card-info">
                      <h3>{category.categoryName}</h3>
                      <p className="category-card-description">
                        {category.description || "No description provided"}
                      </p>
                      <span className="category-product-count">
                        ◇ &nbsp;{category.productCount} {category.productCount === 1 ? "product" : "products"}
                      </span>
                    </div>
                    <span className="category-card-arrow" aria-hidden="true">›</span>
                  </div>
                  <div className="category-card-footer">
                    <span>Category {String(index + 1).padStart(2, "0")}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="category-list-footnote">
            <span aria-hidden="true">ⓘ</span>
            Your categories and product counts are loaded from your store data.
          </div>
        </section>
      </div>
    </div>
  );
}
