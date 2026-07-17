import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiDownload,
  FiSearch,
  FiAlertCircle,
  FiEdit2,
  FiImage,
  FiSmile,
  FiFilter,
} from "react-icons/fi";
import { useForm } from "../context/FormContext";
import { createForm } from "../services/api";
import "../styles/FormTemplates.css";

const EMOJI_ICONS = [
  "🎫", "⭐", "🏥", "💼", "📅", "📊", "❤️", "🎖️", "🎪", "📧",
  "📋", "🔐", "🎓", "🛍️", "🍽️", "🏨", "✈️", "🚗", "💻", "📱",
  "👤", "👥", "🏢", "🌟", "⚙️", "🔔", "📞", "🗺️", "💳", "🎁",
];

const COLORS = [
  "var(--info)", "#EF4444", "var(--warning)", "#06b6d4", "#8b5cf6",
  "var(--success)", "#ec4899", "#f97316", "#6366f1", "#14b8a6",
];

const FormTemplatePage = () => {
  const { formTemplates, templatesLoading, templatesError } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [customizeTemplate, setCustomizeTemplate] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const categories = ["All", ...new Set(formTemplates.map((t) => t.category || t.category))];

  const filteredTemplates = formTemplates.filter((template) => {
    const matchesSearch = template.templateName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template) => {
    setCustomizeTemplate({ ...template });
  };

  const handleSaveCustomization = async () => {
    try {
      await createForm({
        formName: customizeTemplate.templateName,
        description: customizeTemplate.description,
        fields: customizeTemplate.fields,
        status: "draft",
      });

      alert(
        `Form created from template: "${customizeTemplate.templateName}"`
      );
      setCustomizeTemplate(null);
    } catch (error) {
      alert("Error creating form: " + error.message);
    }
  };

  return (
    <div className="form-templates-container">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-0" style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div className="p-4 border-bottom bg-gradient">
            <div className="mb-4">
              <h4 className="fw-bold mb-1">Form Templates</h4>
              <p className="text-muted small mb-0">
                Create and save form templates for reuse
              </p>
            </div>

            {/* Search and Filter */}
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-1">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control border-1"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-1">
                    <FiFilter />
                  </span>
                  <select
                    className="form-select form-select-sm border-1"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="d-flex gap-2 flex-wrap">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm rounded-pill ${
                    selectedCategory === cat
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto" }} className="p-4">
            {templatesLoading && (
              <div className="p-5 text-center">
                <div className="spinner-border text-primary mb-3" />
                <div className="text-muted">Loading templates...</div>
              </div>
            )}

            {templatesError && !templatesLoading && (
              <div className="alert alert-warning d-flex align-items-center">
                <FiAlertCircle className="me-2" />
                <div>
                  <strong>Error loading templates:</strong> {templatesError}
                </div>
              </div>
            )}

            {!templatesLoading && filteredTemplates.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted">
                  {formTemplates.length === 0
                    ? "No templates available yet."
                    : "No matching templates found."}
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {filteredTemplates.map((template) => (
                  <div key={template._id} className="col-md-6 col-lg-4">
                    <div className="template-card">
                      <div
                        className="template-card-header"
                        style={{
                          background: `linear-gradient(135deg, ${template.color || "#6366f1"} 0%, ${adjustBrightness(template.color || "#6366f1", -20)} 100%)`,
                        }}
                      >
                        <div className="template-icon">
                          {template.icon || "📋"}
                        </div>
                        {template.isIndustryTemplate && (
                          <span className="badge bg-white text-dark badge-sm">
                            Industry
                          </span>
                        )}
                      </div>

                      <div className="template-card-body">
                        <h6 className="fw-bold mb-1 text-truncate">
                          {template.templateName}
                        </h6>
                        <p className="text-muted small mb-2 text-truncate">
                          {template.description}
                        </p>

                        <div className="template-meta">
                          <span className="badge bg-light text-dark">
                            {template.category}
                          </span>
                          <span className="badge bg-light text-dark">
                            {template.fields?.length || 0} fields
                          </span>
                        </div>
                      </div>

                      <div className="template-card-footer">
                        <button
                          className="btn btn-sm btn-primary w-100"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <FiDownload size={14} className="me-1" /> Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customize Template Modal */}
      {customizeTemplate && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-semibold d-flex align-items-center gap-2">
                  <span style={{ fontSize: "1.5rem" }}>
                    {customizeTemplate.icon || "📋"}
                  </span>
                  Customize Template
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCustomizeTemplate(null)}
                />
              </div>

              <div className="modal-body">
                {/* Template Info */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-2">Template Name</h6>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={customizeTemplate.templateName}
                    onChange={(e) =>
                      setCustomizeTemplate({
                        ...customizeTemplate,
                        templateName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-4">
                  <h6 className="fw-semibold mb-2">Description</h6>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={customizeTemplate.description || ""}
                    onChange={(e) =>
                      setCustomizeTemplate({
                        ...customizeTemplate,
                        description: e.target.value,
                      })
                    }
                    placeholder="Template description"
                  />
                </div>

                {/* Icon and Color Customization */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                      <FiSmile /> Icon
                    </h6>
                    <div className="position-relative">
                      <button
                        className="btn btn-outline-secondary w-100 text-start"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        style={{ fontSize: "1.2rem" }}
                      >
                        {customizeTemplate.icon || "📋"} Select Icon
                      </button>
                      {showEmojiPicker && (
                        <div className="emoji-picker">
                          {EMOJI_ICONS.map((emoji) => (
                            <button
                              key={emoji}
                              className="emoji-btn"
                              onClick={() => {
                                setCustomizeTemplate({
                                  ...customizeTemplate,
                                  icon: emoji,
                                });
                                setShowEmojiPicker(false);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-2">Color</h6>
                    <div className="position-relative">
                      <button
                        className="btn btn-outline-secondary w-100 text-start"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        style={{
                          backgroundColor: customizeTemplate.color || "#6366f1",
                          color: "white",
                        }}
                      >
                        Select Color
                      </button>
                      {showColorPicker && (
                        <div className="color-picker">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              className="color-btn"
                              style={{
                                backgroundColor: color,
                                border:
                                  customizeTemplate.color === color
                                    ? "3px solid #000"
                                    : "none",
                              }}
                              onClick={() => {
                                setCustomizeTemplate({
                                  ...customizeTemplate,
                                  color,
                                });
                                setShowColorPicker(false);
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fields Preview */}
                <div className="mb-4">
                  <h6 className="fw-semibold mb-2">
                    Fields ({customizeTemplate.fields?.length || 0})
                  </h6>
                  <div className="field-list-preview">
                    {customizeTemplate.fields?.map((field, idx) => (
                      <div key={idx} className="field-item-preview">
                        <div className="field-label">{field.label}</div>
                        <div className="field-type">
                          {field.type}
                          {field.required && (
                            <span className="text-danger ms-1">*</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCustomizeTemplate(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveCustomization}
                >
                  <FiDownload size={14} className="me-1" /> Create Form from Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function adjustBrightness(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return (
    "#" +
    (0x1000000 + (R < 16 ? 0 : 1) * R * 0x10000 + (G < 16 ? 0 : 1) * G * 0x100 + (B < 16 ? 0 : 1) * B)
      .toString(16)
      .slice(1)
  );
}

export default FormTemplatePage;
