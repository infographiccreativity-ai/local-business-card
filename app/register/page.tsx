
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function RegisterBusiness() {
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    category: "",
    description: "",
    location: "",
    phone: "",
    email: "",
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  
async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const { error } = await supabase.from("businesses").insert([
    {
      name: form.businessName,
      category: form.category,
      description: form.description,
      location: form.location,
      phone: form.phone,
      email: form.email || null,
    },
  ]);

  if (error) {
    alert("Business registration failed: " + error.message);
    return;
  }

  setSubmitted(true);
}
  

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="font-bold text-slate-600">
          ← Back to Local Business Card
        </a>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-600">
            Join the local directory
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Register Your Business
          </h1>

          <p className="mt-3 text-slate-600">
            Help customers discover your business and connect with you directly.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-xl bg-green-50 p-5">
              <h2 className="text-xl font-bold text-green-800">
                Form completed!
              </h2>
              <p className="mt-2 text-green-700">
                Thank you for registering {form.businessName}.
                 Your business registration was saved successfully.             </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-5 rounded-xl bg-[#102a43] px-5 py-3 font-bold text-white"
              >
                Edit Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Business Name *
                </label>
                <input
                  required
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Thabo's Car Wash"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Business Category *
                </label>
                <select
                  required
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">Choose a category</option>
                  <option>Home Services</option>
                  <option>Automotive</option>
                  <option>Food & Drink</option>
                  <option>Beauty</option>
                  <option>Shopping</option>
                  <option>Health & Wellness</option>
                  <option>Professional Services</option>
                  <option>Repairs</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Business Description *
                </label>
                <textarea
                  required
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell customers what your business offers"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Town or Area *
                </label>
                <input
                  required
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Ennerdale, Johannesburg"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Business Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 071 234 5678"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Business Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="business@example.co.za"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#102a43] px-6 py-4 font-bold text-white hover:bg-slate-800"
              >
                Submit Business Details
              </button>

             <p className="text-center text-xs text-slate-500">
  Your business details will be submitted securely for registration.
</p>            </form>
          )}
        </div>
      </div>
    </main>
  );
}