
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  logo_url: string | null;
  gallery_urls: string[] | null;
};

type BusinessForm = {
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  email: string;
};

export default function MyBusinessPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<BusinessForm>({
    name: "",
    category: "",
    description: "",
    location: "",
    phone: "",
    email: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("email", user.email)
      .limit(1)
      .maybeSingle();

    if (error) {
      setMessage("Unable to load your business details: " + error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage("No business listing was found for this account.");
      setLoading(false);
      return;
    }

    const businessData = data as Business;

    setBusiness(businessData);

    setForm({
      name: businessData.name || "",
      category: businessData.category || "",
      description: businessData.description || "",
      location: businessData.location || "",
      phone: businessData.phone || "",
      email: businessData.email || "",
    });

    setLogoPreview(businessData.logo_url || "");

    const photos = Array.isArray(businessData.gallery_urls)
      ? businessData.gallery_urls
      : [];

    setGalleryPreviews(photos);

    setLoading(false);
  }

  async function saveBusiness(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!business) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        category: form.category,
        description: form.description,
        location: form.location,
        phone: form.phone,
        email: form.email,
      })
      .eq("id", business.id);

    if (error) {
      setMessage("Could not save changes: " + error.message);
    } else {
      setMessage("Your business details have been updated successfully.");
      setBusiness({ ...business, ...form });
    }

    setSaving(false);
  }

  async function uploadImage(file: File, type: "logo" | "gallery") {
    if (!business) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Please upload a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Each image must be smaller than 5 MB.");
      return;
    }

    if (type === "gallery" && galleryPreviews.length >= 10) {
      setMessage("You can upload a maximum of 10 business photos.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in again before uploading images.");
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${type}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("business-images")
        .getPublicUrl(filePath);

      const imageUrl = publicData.publicUrl;

      if (type === "logo") {
        const { error: updateError } = await supabase
          .from("businesses")
          .update({ logo_url: imageUrl })
          .eq("id", business.id);

        if (updateError) throw updateError;

        setLogoPreview(imageUrl);
        setBusiness({ ...business, logo_url: imageUrl });
        setMessage("Business logo uploaded successfully.");
      } else {
        const updatedPhotos = [...galleryPreviews, imageUrl];

        const { error: updateError } = await supabase
          .from("businesses")
          .update({ gallery_urls: updatedPhotos })
          .eq("id", business.id);

        if (updateError) throw updateError;

        setGalleryPreviews(updatedPhotos);
        setBusiness({ ...business, gallery_urls: updatedPhotos });
        setMessage("Business photo uploaded successfully.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred.";

      setMessage("Image upload failed: " + errorMessage);
    } finally {
      setUploading(false);
    }
  }

async function handleDeletePhoto(photoUrl: string) {
  if (!business) return;

  const confirmed = window.confirm("Are you sure you want to delete this photo?");
  if (!confirmed) return;

  setDeletingPhoto(photoUrl);
  setMessage("");

  try {
    const updatedPhotos = galleryPreviews.filter(
      (photo) => photo !== photoUrl
    );

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ gallery_urls: updatedPhotos })
      .eq("id", business.id);

    if (updateError) throw updateError;

    setGalleryPreviews(updatedPhotos);
    setBusiness({ ...business, gallery_urls: updatedPhotos });

    const urlParts = photoUrl.split("/business-images/");
    const filePath = urlParts[1]?.split("?")[0];

    if (filePath) {
      const { error: deleteError } = await supabase.storage
        .from("business-images")
        .remove([decodeURIComponent(filePath)]);

      if (deleteError) throw deleteError;
    }

    setMessage("Photo deleted successfully.");
  } catch (error) {
    setMessage(
      "Unable to delete photo: " +
      (error instanceof Error ? error.message : "Unknown error")
    );
  } finally {
    setDeletingPhoto(null);
  }
}
  async function handleGalleryUpload(files: FileList | null) {
    if (!files) return;

    const selectedFiles = Array.from(files);

    if (galleryPreviews.length + selectedFiles.length > 10) {
      setMessage("You can only have 10 gallery photos in total.");
      return;
    }

    for (const file of selectedFiles) {
      await uploadImage(file, "gallery");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading your business dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-6 md:p-8">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Business Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your business listing and photos.
            </p>
          </div>

          <button
            onClick={signOut}
            className="bg-slate-800 text-white px-5 py-2 rounded-lg hover:bg-slate-700"
          >
            Sign Out
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-800">
            {message}
          </div>
        )}

        {business && (
          <>
            <form onSubmit={saveBusiness} className="space-y-4">
              {(
                [
                  ["name", "Business Name"],
                  ["category", "Category"],
                  ["description", "Description"],
                  ["location", "Location"],
                  ["phone", "Phone Number"],
                  ["email", "Email Address"],
                ] as [keyof BusinessForm, string][]
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block font-medium mb-1 text-slate-700">
                    {label}
                  </label>

                  {field === "description" ? (
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={4}
                      className="w-full border rounded-lg p-3"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                      className="w-full border rounded-lg p-3"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            {/* BUSINESS LOGO */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-bold mb-3">Business Logo</h2>

              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Business Logo"
                  className="w-32 h-32 object-contain border rounded-lg mb-3"
                />
              )}

             <label className="inline-block bg-blue-700 text-white px-5 py-3 rounded-lg cursor-pointer hover:bg-blue-800 font-semibold">
  {uploading ? "Uploading..." : "Choose Business Logo"}

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    disabled={uploading}
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) uploadImage(file, "logo");
      e.target.value = "";
    }}
  />
</label>
              <p className="text-sm text-slate-500 mt-2">
                Upload one business logo. Maximum file size: 5 MB.
              </p>
            </div>

            {/* BUSINESS GALLERY */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-bold mb-3">Business Photos</h2>

              <p className="text-sm text-slate-600 mb-3">
                Upload up to 10 photos showcasing your business and services.
              </p>

             <label className="inline-block cursor-pointer">
  <span
    className={`inline-block px-6 py-3 rounded-lg font-semibold text-white ${
      uploading || galleryPreviews.length >= 10
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-700 hover:bg-blue-800"
    }`}
  >
    Choose Business Photos
  </span>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    disabled={uploading || galleryPreviews.length >= 10}
    className="hidden"
    onChange={(e) => {
      handleGalleryUpload(e.target.files);
      e.target.value = "";
    }}
  />
</label>
              <p className="text-sm text-slate-500 mt-2">
                {galleryPreviews.length} of 10 photos uploaded.
              </p>

              {uploading && (
                <p className="text-blue-700 mt-3">
                  Uploading image...
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                {galleryPreviews.map((photo, index) => (
  <div key={photo} className="relative group">
    <img
      src={photo}
      alt={`Business photo ${index + 1}`}
      onClick={() => setSelectedPhoto(photo)}
      className="w-full h-36 object-cover rounded-lg border cursor-pointer hover:opacity-90"
    />

    <button
      type="button"
      onClick={() => handleDeletePhoto(photo)}
      disabled={deletingPhoto === photo}
      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
    >
      {deletingPhoto === photo ? "Deleting..." : "Delete"}
    </button>
  </div>
))}             </div>
            </div>
          </>
        )}
      </div>
{selectedPhoto && (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    onClick={() => setSelectedPhoto(null)}
  >
    <button
      type="button"
      onClick={() => setSelectedPhoto(null)}
      className="absolute top-5 right-5 bg-white text-black px-4 py-2 rounded-lg font-semibold"
    >
      Close ✕
    </button>

    <img
      src={selectedPhoto}
      alt="Enlarged business photo"
      className="max-w-full max-h-[85vh] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
    </main>
  );
}
