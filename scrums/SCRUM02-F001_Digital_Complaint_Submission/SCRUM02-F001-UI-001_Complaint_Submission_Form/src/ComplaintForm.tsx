import React, { useState } from 'react';
import { validateComplaintForm, submitComplaint } from './ComplaintFormLogic';

export interface ComplaintFormProps {
  user: { collegeId: string; name: string };
  onSuccess?: (referenceId: string) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ user, onSuccess }) => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Only JPG/PNG images supported' }));
        return;
      }
      setErrors(prev => { const n = { ...prev }; delete n.file; return n; });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await submitComplaint({
      category,
      location,
      description,
      photoUrls: photoPreview ? [photoPreview] : [],
      submitterId: user.collegeId
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrors(result.errors || {});
      return;
    }

    setReferenceId(result.referenceId);
    if (onSuccess && result.referenceId) {
      onSuccess(result.referenceId);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit Campus Complaint</h2>
      {referenceId ? (
        <div data-testid="confirmation-alert" className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <h3 className="font-semibold text-lg">Complaint Submitted Successfully!</h3>
          <p className="mt-1">Tracking Reference ID: <span className="font-mono font-bold" data-testid="tracking-reference">{referenceId}</span></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              data-testid="category-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="">Select Category</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="IT Support">IT Support</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Sanitation">Sanitation</option>
            </select>
            {errors.category && <p data-testid="category-error" className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              data-testid="location-input"
              placeholder="e.g. Science Block, 3rd Floor, Lab 304"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
            {errors.location && <p data-testid="location-error" className="text-red-600 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              data-testid="description-input"
              rows={3}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attach Photo (JPG/PNG)</label>
            <input
              type="file"
              data-testid="photo-input"
              accept="image/png, image/jpeg"
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-gray-500"
            />
            {errors.file && <p data-testid="file-error" className="text-red-600 text-sm mt-1">{errors.file}</p>}
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-2 h-32 w-auto rounded object-cover border" />
            )}
          </div>

          {errors.content && <p data-testid="content-error" className="text-red-600 text-sm">{errors.content}</p>}

          <button
            type="submit"
            data-testid="submit-btn"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      )}
    </div>
  );
};
