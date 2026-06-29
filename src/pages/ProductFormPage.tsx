import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload';
import type { Category, Characteristic } from '../types';

interface FormErrors {
  title?: string;
  slug?: string;
  categoryId?: string;
  price?: string;
  article?: string;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    priceType: 'FIXED' as 'FIXED' | 'QUOTE',
    price: '',
    article: '',
    categoryId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/categories'),
      isEdit && id ? apiClient.get(`/products/id/${id}`) : Promise.resolve(null),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);

        if (prodRes?.data) {
          const p = prodRes.data;
          setForm({
            title: p.title,
            slug: p.slug,
            description: p.description || '',
            priceType: p.priceType || 'FIXED',
            price: p.price?.toString() || '',
            article: p.article || '',
            categoryId: p.categoryId,
          });
          setCharacteristics(p.characteristics || []);
          setImages(
            p.images?.map((img: any) => ({ id: img.id, url: img.url })) || []
          );
        }
      })
      .catch((err) => addToast('error', getErrorMessage(err)))
      .finally(() => setFetching(false));
  }, [id, isEdit, addToast]);

  const generateSlug = (title: string) => {
    if (isEdit) return form.slug;
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/[а-яё]/g, '');
  };

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.title.trim()) {
      e.title = 'Название обязательно';
    } else if (form.title.length > 200) {
      e.title = 'Название не может превышать 200 символов';
    }

    if (!form.slug.trim()) {
      e.slug = 'Slug обязателен';
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      e.slug = 'Slug может содержать только латинские буквы, цифры и дефисы';
    }

    if (!form.categoryId) {
      e.categoryId = 'Выберите категорию';
    }

    if (form.priceType === 'FIXED' && form.price) {
      const priceNum = parseFloat(form.price);
      if (isNaN(priceNum) || priceNum < 0) {
        e.price = 'Цена должна быть положительным числом';
      }
    }

    if (form.article && form.article.length > 50) {
      e.article = 'Артикул не может превышать 50 символов';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addCharacteristic = () => {
    setCharacteristics([...characteristics, { key: '', value: '' }]);
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const updateCharacteristic = (
    index: number,
    field: 'key' | 'value',
    val: string
  ) => {
    const updated = [...characteristics];
    updated[index] = { ...updated[index], [field]: val };
    setCharacteristics(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        title: form.title,
        slug: form.slug,
        description: form.description || undefined,
        priceType: form.priceType,
        price:
          form.priceType === 'FIXED' ? parseFloat(form.price) || 0 : null,
        article: form.article || undefined,
        categoryId: form.categoryId,
        characteristics: characteristics.filter((c) => c.key && c.value),
        imageIds: images.map((img) => img.id),
      };

      if (isEdit) {
        await apiClient.put(`/admin/products/${id}`, payload);
        addToast('success', 'Товар обновлён');
      } else {
        await apiClient.post('/admin/products', payload);
        addToast('success', 'Товар создан');
      }
      navigate('/admin/products');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">
        {isEdit ? 'Редактирование товара' : 'Создание товара'}
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>
              Название <span className="required">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: generateSlug(title),
                }));
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={errors.title ? 'input-error' : ''}
              maxLength={200}
            />
            {errors.title && (
              <span className="field-error">{errors.title}</span>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>
              Slug <span className="required">*</span>
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setForm((f) => ({ ...f, slug: e.target.value }));
                if (errors.slug)
                  setErrors((prev) => ({ ...prev, slug: undefined }));
              }}
              className={errors.slug ? 'input-error' : ''}
            />
            {errors.slug && (
              <span className="field-error">{errors.slug}</span>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Описание</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              maxLength={5000}
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>
              Категория <span className="required">*</span>
            </label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => {
                setForm((f) => ({ ...f, categoryId: e.target.value }));
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
              className={errors.categoryId ? 'input-error' : ''}
            >
              <option value="">- Выберите категорию -</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="field-error">{errors.categoryId}</span>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Артикул</label>
            <input
              value={form.article}
              onChange={(e) => {
                setForm((f) => ({ ...f, article: e.target.value }));
                if (errors.article)
                  setErrors((prev) => ({ ...prev, article: undefined }));
              }}
              placeholder="Например: BRX-001"
              className={errors.article ? 'input-error' : ''}
              maxLength={50}
            />
            {errors.article && (
              <span className="field-error">{errors.article}</span>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Тип цены</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label
                className={`btn ${
                  form.priceType === 'FIXED' ? 'btn-primary' : ''
                }`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="priceType"
                  value="FIXED"
                  checked={form.priceType === 'FIXED'}
                  onChange={() =>
                    setForm((f) => ({ ...f, priceType: 'FIXED' }))
                  }
                  hidden
                />
                Фиксированная цена
              </label>
              <label
                className={`btn ${
                  form.priceType === 'QUOTE' ? 'btn-primary' : ''
                }`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="priceType"
                  value="QUOTE"
                  checked={form.priceType === 'QUOTE'}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      priceType: 'QUOTE',
                      price: '',
                    }))
                  }
                  hidden
                />
                Цена по запросу
              </label>
            </div>
          </div>

          {form.priceType === 'FIXED' && (
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Цена (₽)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => {
                  setForm((f) => ({ ...f, price: e.target.value }));
                  if (errors.price)
                    setErrors((prev) => ({ ...prev, price: undefined }));
                }}
                placeholder="0.00"
                className={errors.price ? 'input-error' : ''}
              />
              {errors.price && (
                <span className="field-error">{errors.price}</span>
              )}
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Характеристики</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {characteristics.map((char, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    placeholder="Ключ"
                    value={char.key}
                    onChange={(e) =>
                      updateCharacteristic(i, 'key', e.target.value)
                    }
                    style={{ flex: 1 }}
                  />
                  <input
                    placeholder="Значение"
                    value={char.value}
                    onChange={(e) =>
                      updateCharacteristic(i, 'value', e.target.value)
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeCharacteristic(i)}
                    title="Удалить характеристику"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm"
                onClick={addCharacteristic}
                style={{ alignSelf: 'flex-start' }}
              >
                + Добавить характеристику
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Изображения</label>
            <FileUpload
              images={images}
              onImagesChange={setImages}
              multiple
              category="PRODUCT_IMAGE"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/admin/products')}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Сохранение...'
                : isEdit
                  ? 'Сохранить'
                  : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
