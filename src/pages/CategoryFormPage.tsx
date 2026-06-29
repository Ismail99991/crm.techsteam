import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload';
import type { Category } from '../types';

interface FormErrors {
  name?: string;
  slug?: string;
}

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [image, setImage] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    apiClient
      .get(`/categories/${id}`)
      .then((res) => {
        const cat: Category = res.data;
        setForm({
          name: cat.name,
          slug: cat.slug,
          title: cat.title || '',
          description: cat.description || '',
        });
        if (cat.image) {
          setImage([{ id: cat.image.id, url: cat.image.url }]);
        }
      })
      .catch((err) => addToast('error', getErrorMessage(err)))
      .finally(() => setFetching(false));
  }, [id, isEdit, addToast]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) {
      e.name = 'Название обязательно';
    } else if (form.name.length > 100) {
      e.name = 'Название не может быть длиннее 100 символов';
    }
    if (!form.slug.trim()) {
      e.slug = 'Slug обязателен';
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      e.slug = 'Slug может содержать только латинские буквы, цифры и дефисы';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        ...form,
        imageId: image[0]?.id || null,
      };

      if (isEdit) {
        await apiClient.put(`/admin/categories/${id}`, payload);
        addToast('success', 'Категория обновлена');
      } else {
        await apiClient.post('/admin/categories', payload);
        addToast('success', 'Категория создана');
      }
      navigate('/admin/categories');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    if (isEdit) return form.slug;
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/[а-яё]/g, '');
  };

  if (fetching) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">
        {isEdit ? 'Редактирование категории' : 'Создание категории'}
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>
              Название <span className="required">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: isEdit ? f.slug : generateSlug(name),
                }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={errors.name ? 'input-error' : ''}
              maxLength={100}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
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
                if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
              }}
              className={errors.slug ? 'input-error' : ''}
            />
            {errors.slug && <span className="field-error">{errors.slug}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Заголовок (title)</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={200}
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Описание</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={2000}
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Изображение</label>
            <FileUpload
              images={image}
              onImagesChange={setImage}
              category="CATEGORY_IMAGE"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/admin/categories')}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
