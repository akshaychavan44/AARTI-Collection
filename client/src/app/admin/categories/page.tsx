"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Plus,
  FolderTree,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  gender: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"BOYS" | "GIRLS">("BOYS");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete modal state
  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<CategoryItem[]>("/admin/categories");
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setGender("BOYS");
    setDescription("");
    setIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setGender(cat.gender as any);
    setDescription(cat.description || "");
    setIsActive(cat.isActive);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setModalError(null);

      const payload = {
        name: name.trim(),
        gender,
        description: description.trim(),
        isActive,
      };

      if (editingCategory) {
        const res = await api.put(`/admin/categories/${editingCategory.id}`, payload);
        if (res.success) {
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.post("/admin/categories", payload);
        if (res.success) {
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCat) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      const res = await api.delete(`/admin/categories/${deletingCat.id}`);
      if (res.success) {
        setDeletingCat(null);
        fetchCategories();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize kids clothing lines into boys and girls collections.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading && categories.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-xs text-slate-400">Loading category lines...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderTree className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">No Categories Configured</h2>
            <p className="text-xs text-slate-400">Add your first category using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5 font-semibold">Category Name</th>
                  <th className="py-3.5 px-4 font-semibold">Gender Line</th>
                  <th className="py-3.5 px-4 font-semibold">Products Assigned</th>
                  <th className="py-3.5 px-4 font-semibold">Description</th>
                  <th className="py-3.5 px-4 font-semibold">Showcase</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{cat.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          cat.gender === "BOYS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-pink-50 text-pink-700 border border-pink-200"
                        }`}
                      >
                        {cat.gender}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                      {cat.description || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingCat(cat);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethnic & Festive Sets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender Line *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                >
                  <option value="BOYS">Boys Wear</option>
                  <option value="GIRLS">Girls Wear</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description for SEO and catalog..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span>Active & Visible in Shop</span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal with Safeguard Warning */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete &quot;{deletingCat.name}&quot;?
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Categories with assigned products cannot be deleted. If this category has products,
              you must reassign or remove them first to preserve catalog integrity.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingCat(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
                  </>
                ) : (
                  "Delete Category"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
