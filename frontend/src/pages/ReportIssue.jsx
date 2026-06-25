import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import calculatePriority from "../utils/priorityCalculator";
import "./ReportIssue.css";

const ReportIssue = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    severity: "medium",
    block: "",
    floor: "",
    flatNumber: "",
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState({ score: 0, label: "Low" });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  // Calculate priority when form data changes
  useEffect(() => {
    const severityToLevel = {
      low: 1,
      medium: 2,
      high: 4,
      critical: 5
    };

    const urgencyToLevel = {
      open: 3,
      in_progress: 4,
      resolved: 1,
      closed: 1
    };

    const calculatedPriority = calculatePriority({
      criticalLevel: severityToLevel[formData.severity] || 1,
      upvotes: 0, // new issue has no upvotes
      urgencyLevel: urgencyToLevel["open"] || 1, // new issue is open
      createdAt: new Date(), // current time
      status: "open"
    });

    setPriority(calculatedPriority);
  }, [formData.severity]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setFormData({
      ...formData,
      images: files
    });

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const removedPreview = imagePreviews[index];
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(removedPreview);
    
    setFormData({
      ...formData,
      images: newImages
    });
    setImagePreviews(newPreviews);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Title is required.";
    }
    if (formData.title.trim().length < 5) {
      return "Title must be at least 5 characters long.";
    }
    if (formData.title.trim().length > 120) {
      return "Title cannot exceed 120 characters.";
    }
    if (!formData.description.trim()) {
      return "Description is required.";
    }
    if (formData.description.trim().length < 10) {
      return "Description must be at least 10 characters long.";
    }
    if (!formData.block.trim()) {
      return "Block is required.";
    }
    return null;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("severity", formData.severity);
      formDataToSend.append("location", JSON.stringify({
        block: formData.block,
        floor: formData.floor,
        flatNumber: formData.flatNumber,
      }));

      // Add images
      formData.images.forEach((image, index) => {
        formDataToSend.append("images", image);
      });

      const res = await axios.post("/issues", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Issue reported successfully!");

      // Clear form
      setFormData({
        title: "",
        description: "",
        category: "other",
        severity: "medium",
        block: "",
        floor: "",
        flatNumber: "",
        images: []
      });
      
      // Clean up image previews
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setImagePreviews([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to report issue. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-issue-container">
      <div className="report-issue-card">
        <h2>Report New Issue</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Title and Category Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Issue title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="plumbing">Plumbing</option>
                <option value="electricity">Electricity</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="security">Security</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Severity and Block Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <div className="priority-display">
                <small>Priority: <strong>{priority.label}</strong> (Score: {priority.score})</small>
              </div>
            </div>

            <div className="form-group">
              <label>Block *</label>
              <input
                type="text"
                name="block"
                placeholder="Apartment block"
                value={formData.block}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Floor and Flat Number Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Floor</label>
              <input
                type="text"
                name="floor"
                placeholder="Floor number"
                value={formData.floor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Flat Number</label>
              <input
                type="text"
                name="flatNumber"
                placeholder="Flat number"
                value={formData.flatNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="form-row form-row-full">
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                placeholder="Describe the issue in detail"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-row form-row-full">
            <div className="image-upload-section">
              <label htmlFor="images" className="image-upload-label">
                📷 Choose Images (Max 5)
              </label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <p>Drag and drop or click to upload</p>
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="form-row form-row-full">
              <div>
                <p style={{ marginBottom: "10px", fontWeight: "500" }}>
                  Selected Images ({imagePreviews.length}/5)
                </p>
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button type="button" onClick={() => removeImage(index)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="report-btn" disabled={loading}>
            {loading ? "⏳ Reporting..." : "✓ Report Issue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;