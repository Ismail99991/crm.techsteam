import { useCallback, useState } from 'react';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

interface Props {
  images: { id: string; url: string }[];
  onImagesChange: (images: { id: string; url: string }[]) => void;
  multiple?: boolean;
  category?: 'PRODUCT_IMAGE' | 'CATEGORY_IMAGE' | 'AVATAR';
}

export default function FileUpload({
  images,
  onImagesChange,
  multiple = false,
  category = 'PRODUCT_IMAGE',
}: Props) {
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      setUploading(true);
      const uploaded: { id: string; url: string }[] = [];

      try {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', category);

          const { data } = await apiClient.post('/upload/file', formData);

          uploaded.push({ id: data.id, url: data.url });
        }

        if (multiple) {
          onImagesChange([...images, ...uploaded]);
        } else {
          onImagesChange(uploaded.slice(0, 1));
        }

        addToast('success', `Изображение${files.length > 1 ? 'я' : ''} загружены`);
      } catch (err) {
        addToast('error', getErrorMessage(err));
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, multiple, category, addToast]
  );

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="file-upload">
      <div className="file-upload-previews">
        {images.map((img) => (
          <div key={img.id} className="file-upload-preview">
            <img src={img.url} alt="preview" />
            <button
              type="button"
              className="file-upload-remove"
              onClick={() => removeImage(img.id)}
              title="Удалить"
            >
              ×
            </button>
          </div>
        ))}
        {uploading && (
          <div className="file-upload-preview file-upload-loading">
            <div className="spinner" />
          </div>
        )}
      </div>
      <label className={`btn btn-sm ${uploading ? 'btn-disabled' : ''}`}>
        {uploading
          ? 'Загрузка...'
          : images.length > 0
            ? 'Добавить ещё'
            : 'Выбрать изображение'}
        <input
          type="file"
          accept="image/*"
          hidden
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
