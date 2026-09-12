/**
 * Core form validation and submission handler for SCRUM02-F001-UI-001
 */
function validateComplaintForm(formData) {
  const errors = {};
  if (!formData.category || !formData.category.trim()) {
    errors.category = "Category is required";
  }
  if (!formData.location || !formData.location.trim()) {
    errors.location = "Location is required";
  }
  const hasDescription = formData.description && formData.description.trim().length > 0;
  const hasPhoto = formData.photoUrls && formData.photoUrls.length > 0;
  if (!hasDescription && !hasPhoto) {
    errors.content = "Either a description or a photo must be provided";
  }
  if (formData.file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(formData.file.type)) {
      errors.file = "Only JPG and PNG images are supported";
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

async function submitComplaint(formData, apiService = null) {
  const validation = validateComplaintForm(formData);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      referenceId: null
    };
  }

  // Default API service mock
  const api = apiService || {
    post: async (endpoint, data) => ({
      status: 201,
      data: {
        referenceId: 'CMP-' + Math.floor(100000 + Math.random() * 900000),
        status: 'Open',
        ...data
      }
    })
  };

  const response = await api.post('/api/complaints', formData);
  return {
    success: true,
    referenceId: response.data.referenceId,
    complaint: response.data
  };
}

module.exports = { validateComplaintForm, submitComplaint };
