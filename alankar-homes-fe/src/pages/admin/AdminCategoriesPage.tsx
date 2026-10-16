import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../../features/shop/shopService';
import type { Category } from '../../features/shop/shopTypes';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../utils/helpers';
import { useConfirm, useToast } from '../../hooks/useFeedback';

export const AdminCategoriesPage: React.FC = () => {
  const { data: categories, isLoading, error, reload } = useAsync(fetchCategories, []);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const resetForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
  };

  const startEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setDescription(category.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Category name must be at least 2 characters');
      return;
    }
    setIsSaving(true);
    try {
      const data = { name: name.trim(), description: description.trim() };
      if (editing) {
        await updateCategory(editing.id, data);
      } else {
        await createCategory(data);
      }
      toast.success(editing ? 'Category updated' : 'Category added');
      resetForm();
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const count = category.productCount || 0;
    const ok = await confirm({
      title: `Delete the "${category.name}" category?`,
      message: count > 0 ? `Its ${count} product(s) will stay in the shop without a category.` : undefined,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteCategory(category.id);
      if (editing?.id === category.id) resetForm();
      toast.success('Category deleted');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-5 lg:sticky lg:top-28">
        <h1 className="font-serif text-2xl text-[#ecc588]">{editing ? 'Edit category' : 'New category'}</h1>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Candles" />
        <Input
          label="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Hand-poured soy candles"
        />
        <Button type="submit" isLoading={isSaving}>{editing ? 'Save category' : 'Add category'}</Button>
        {editing && (
          <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
        )}
      </form>

      <div className="space-y-3">
        {isLoading && <Spinner />}
        {error && <ErrorMessage message={error} onRetry={reload} />}
        {categories && categories.length === 0 && (
          <p className="glass-card rounded-xl p-8 text-sm text-[#8ba5a0] text-center">
            No categories yet. Add one like "Candles", "Gift hampers" or "Home decor".
          </p>
        )}
        {categories?.map((category) => (
          <div key={category.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-100 font-medium">{category.name}</p>
              <p className="text-xs text-[#8ba5a0] truncate">
                {category.productCount ?? 0} products{category.description ? ` · ${category.description}` : ''}
              </p>
            </div>
            <button
              onClick={() => startEdit(category)}
              title="Edit"
              className="p-2.5 rounded-lg text-stone-300 hover:bg-[#0e3f38]/50 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category)}
              title="Delete"
              className="p-2.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-[#0e3f38]/50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
