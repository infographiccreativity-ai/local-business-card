"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
  { name: "Home Services", icon: "🏠" },
  { name: "Automotive", icon: "🚗" },
  { name: "Food & Drink", icon: "🍔" },
  { name: "Beauty", icon: "💇" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Health & Wellness", icon: "❤️" },
  { name: "Professional Services", icon: "💼" },
  { name: "Repairs", icon: "🔧" },
];


export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
const [businesses, setBusinesses] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  async function loadBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading businesses:", error.message);
      setLoading(false);
      return;
    }

    setBusinesses(data ?? []);
    setLoading(false);
  }

  loadBusinesses();
}, []);

   
const uniqueBusinesses = businesses.filter((business, index, allBusinesses) => {
  return (
    index ===
    allBusinesses.findIndex(
      (item) =>
        item.name.trim().toLowerCase() ===
        business.name.trim().toLowerCase()
    )
  );
});

const filtered = uniqueBusinesses.filter((business) => {
  const matchesCategory =
    selectedCategory === "All" ||
    business.category === selectedCategory;

  const term = search.toLowerCase().trim();

  const matchesSearch =
    !term ||
    `${business.name} ${business.category} ${business.description} ${business.location}`
      .toLowerCase()
      .includes(term);

  return matchesCategory && matchesSearch;
});  

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-[#102a43] text-white flex items-center justify-center text-2xl">⌖</span>
            <span>
              <span className="block font-black tracking-tight text-lg">LOCAL BUSINESS CARD</span>
              <span className="block text-xs text-slate-500">Your community. Your businesses.</span>
            </span>
          </a>
          <a href="#list-business" className="bg-[#102a43] text-white px-5 py-3 rounded-xl font-bold">
            List Your Business ↗
          </a>
        </div>
      </header>

      <section className="bg-[#102a43] text-white">
        <div className="max-w-7xl mx-auto px-5 py-20">
          <p className="uppercase tracking-[0.2em] text-sm font-bold text-[#e7c873] mb-4">
            Discover. Connect. Support local.
          </p>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight max-w-3xl">
            Put Every Local Business <span className="text-[#e7c873]">on the Map.</span>
          </h1>
          <p className="text-slate-200 mt-5 max-w-2xl text-lg leading-8">
            Discover local services, explore independent businesses and connect directly with the people in your community.
          </p>

          <div className="mt-9 max-w-3xl rounded-2xl bg-white p-3 flex flex-col sm:flex-row gap-3">
            <label className="flex flex-1 items-center gap-3 px-3">
              <span className="text-slate-500 text-xl">⌕</span>
              <span className="sr-only">Search businesses</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search plumber, barber, car wash..."
                className="w-full min-w-0 py-3 text-slate-900 outline-none"
              />
            </label>
            <button
              onClick={() => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#e7c873] text-[#102a43] font-bold rounded-xl px-6 py-3"
            >
              Find Businesses
            </button>
          </div>
          <p className="text-sm text-slate-300 mt-4">Find local businesses. Contact them directly.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-black mb-2">Explore Categories</h2>
        <p className="text-slate-500 mb-6">What are you looking for today?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`rounded-xl border p-4 text-left font-bold ${selectedCategory === "All" ? "bg-[#e9eff5] border-[#102a43]" : "bg-white border-slate-200"}`}
          >
            <span className="text-2xl block mb-2">✦</span>
            All Businesses
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`rounded-xl border p-4 text-left font-bold ${selectedCategory === category.name ? "bg-[#e9eff5] border-[#102a43]" : "bg-white border-slate-200"}`}
            >
              <span className="text-2xl block mb-2">{category.icon}</span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="businesses" className="max-w-7xl mx-auto px-5 pb-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500">The local directory</p>
            <h2 className="text-2xl font-black mt-2">Discover Local Businesses</h2>
          </div>
         <span className="text-sm text-slate-500">
  {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((business) => (
            <article
  key={business.id}
  onClick={() => window.location.href = `/business/${business.id}`}
  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition cursor-pointer"
>
             {business.logo_url ? (
  <img
    src={business.logo_url}
    alt={`${business.name} logo`}
    className="w-20 h-20 object-contain rounded-xl border border-slate-200"
  />
) : (
  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-3xl">
    {business.icon || "🏢"}
  </div>
)}              <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mt-4">{business.category}</p>
              <h3 className="text-lg font-black mt-1">{business.name}</h3>
              <p className="text-slate-600 text-sm mt-2">{business.description}</p>
              <p className="text-slate-500 text-sm mt-4">📍 {business.location}</p>
<p className="text-slate-500 text-sm mt-2">✉️ {business.email}</p>
                          </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <h3 className="font-bold text-lg">No businesses found</h3>
            <p className="text-slate-500 mt-2">Try another search or category.</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-4 bg-[#102a43] text-white px-5 py-3 rounded-xl font-bold"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      <section id="list-business" className="bg-[#e9eff5]">
        <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col sm:flex-row gap-6 justify-between sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">For business owners</p>
            <h2 className="text-2xl font-black mt-2">Every business deserves to be found.</h2>
            <p className="text-slate-600 mt-2">We're building a simpler way for local businesses to get discovered.</p>
          </div>
          <button
           onClick={() => window.location.href = "/register"}           
 className="bg-[#102a43] text-white rounded-xl px-6 py-3 font-bold shrink-0"
          >
            + Create My Business
          </button>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col sm:flex-row gap-2 justify-between text-sm text-slate-500">
          <span className="font-bold text-slate-700">LOCAL BUSINESS CARD</span>
          <span>Discover local. Support local.</span>
         <span>Connecting local businesses with their communities.</span>
        </div>
      </footer>
    </main>
  );
}