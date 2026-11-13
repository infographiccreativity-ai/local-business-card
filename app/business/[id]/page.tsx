"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function BusinessProfileContent() {
  const params = useParams();
  const id = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error.message);
      } else {
        setBusiness(data);
      }

      setLoading(false);
    }

    if (id) loadBusiness();
  }, [id]);

  if (loading) {
    return <main className="p-8">Loading business profile...</main>;
  }

  if (!business) {
    return <main className="p-8">Business not found.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <button
          onClick={() => window.history.back()}
          className="text-blue-700 mb-6"
        >
          ← Back to businesses
        </button>

        <div className="text-5xl mb-4">{business.icon || "🏢"}</div>
{business.logo_url && (
  <div className="mb-6">
    <img
      src={business.logo_url}
      alt={`${business.name} logo`}
      className="w-36 h-36 object-contain rounded-xl border bg-white p-2"
    />
  </div>
)}

{business.gallery_urls && business.gallery_urls.length > 0 && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-4">
      Our Work & Services
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {business.gallery_urls.map((photo: string, index: number) => (
        <img
          key={photo}
          src={photo}
          alt={`${business.name} photo ${index + 1}`}
          className="w-full h-48 object-cover rounded-xl border"
        />
      ))}
    </div>
  </div>
)}

        <p className="text-sm uppercase tracking-wide text-slate-500 font-bold">
          {business.category}
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          {business.name}
        </h1>

        <p className="text-slate-600 mt-4">{business.description}</p>

        <div className="mt-6 space-y-3 text-slate-700">
         <p>📍 {business.location}</p>

<p>📞 {business.phone}</p>

<a
  href={`https://wa.me/${business.phone.replace(/\D/g, "").replace(/^0/, "27")}`}
  target="_blank"
  rel="noopener noreferrer"
  className="block w-fit mb-3 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
>
  Chat on WhatsApp
</a>

<a
  href={`mailto:${business.email}`}
  className="text-blue-700 hover:underline"
>
  {business.email}
</a>        </div>
      </div>
    </main>
  );
}
export default function BusinessProfile() {
  return (
    <Suspense fallback={<main className="p-8">Loading business profile...</main>}>
      <BusinessProfileContent />
    </Suspense>
  );
}