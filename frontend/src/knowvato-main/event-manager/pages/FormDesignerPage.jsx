import React, { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiBox,
  FiEdit2,
  FiCopy,
  FiSearch,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import { useForm } from "../context/FormContext";
import AddFormModal from "../components/forms/AddFormModal";
import FormEditor from "../components/forms/FormEditor";

const FormDesignerPage = () => {
  const { forms, formsLoading, formsError, deleteForm } = useForm();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState(null);

  const filteredForms = forms.filter((form) => {
    const matchesSearch = form.formName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || form.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteForm = async (formId) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      setDeleting(formId);
      try {
        await deleteForm(formId);
      } catch (error) {
        alert("Failed to delete form: " + error.message);
      } finally {
        setDeleting(null);
      }
    }
  };

  const generateFormSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");
  };

  const copyLink = (formId) => {
    const form = forms.find(f => f.id === formId || f._id === formId);
    const slug = generateFormSlug(form?.formName || "form");
    const link = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(link);
    alert("Form link copied!");
  };

  const handleEditSelection = (form) => {
    setFormToEdit(form);
    setShowAddModal(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return { date: `${dd}-${mm}-${yyyy}`, time };
  };

  if (editingFormId) {
    return (
      <FormEditor
        formId={editingFormId}
        onBack={() => setEditingFormId(null)}
      />
    );
  }

  return (
    <div className="card border-0 shadow-sm h-100">
      <div
        className="card-body p-0"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Form Designer</h5>
              <p className="text-muted small mb-0">
                Create and manage registration forms for your events.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              disabled={formsLoading}
            >
              <FiPlus className="me-2" /> Add Form
            </button>
          </div>

          {/* Filter Bar */}
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="saved">Saved</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {formsLoading && (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mb-3" />
            <div className="text-muted">Loading forms...</div>
          </div>
        )}

        {/* Error State */}
        {formsError && !formsLoading && (
          <div className="p-3 m-3 alert alert-warning d-flex align-items-center">
            <FiAlertCircle className="me-2" />
            <div>
              <strong>Error loading forms:</strong> {formsError}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto" }} className="p-3">
          {!formsLoading && filteredForms.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">No forms yet.</div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus className="me-1" /> Create your first form
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Form Name</th>
                    <th>Event Name</th>
                    <th>Copy Link</th>
                    <th>Created By</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr key={form.id}>
                      <td className="fw-semibold">{form.formName}</td>
                      <td>{form.eventName}</td>
                      <td>
                        <button
                          className="btn btn-link btn-sm p-0"
                          onClick={() => copyLink(form.id)}
                          title="Copy form link"
                        >
                          <FiCopy size={18} />
                        </button>
                      </td>
                      <td>{form.createdBy || "System"}</td>
                      <td>
                        {(() => {
                          const formatted = formatDateTime(form.createdAt);
                          return (
                            <div>
                              <div>{formatted.date}</div>
                              <div className="text-muted small">
                                {formatted.time}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              form.status === "draft"
                                ? "#fef3c7"
                                : form.status === "saved"
                                  ? "#dbeafe"
                                  : "#dcfce7",
                            color:
                              form.status === "draft"
                                ? "#92400e"
                                : form.status === "saved"
                                  ? "#1e40af"
                                  : "#166534",
                          }}
                        >
                          {form.status.charAt(0).toUpperCase() +
                            form.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setEditingFormId(form.id)}
                            title="Open designer"
                            disabled={deleting === form.id}
                          >
                            <FiBox size={16} />
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEditSelection(form)}
                            title="Edit form"
                            disabled={deleting === form.id}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteForm(form.id)}
                            title="Delete form"
                            disabled={deleting === form.id}
                          >
                            {deleting === form.id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <FiTrash2 size={14} />
                            )}
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
      </div>

      {/* Add Form Modal */}
      {showAddModal && (
        <AddFormModal
          formToEdit={formToEdit}
          onClose={() => {
            setShowAddModal(false);
            setFormToEdit(null);
          }}
          onFormCreated={(form) => {
            setShowAddModal(false);
            setFormToEdit(null);
            setEditingFormId(form.id);
          }}
        />
      )}
    </div>
  );
};

export default FormDesignerPage;
