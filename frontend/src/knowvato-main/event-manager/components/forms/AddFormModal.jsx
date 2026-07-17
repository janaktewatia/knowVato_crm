import React, { useState, useEffect } from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import { useEventData } from "../../context/EventDataContext";
import { useForm } from "../../context/FormContext";
import { useAuth } from "../../context/AuthContext";

const AddFormModal = ({ onClose, onFormCreated, formToEdit = null }) => {
  const { events, categories } = useEventData();
  const { createForm, updateForm, setCurrentForm } = useForm();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    formName: "",
    eventId: "",
    selectedFields: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [initializedFromEdit, setInitializedFromEdit] = useState(false);
  const [alignment, setAlignment] = useState("center");

  useEffect(() => {
    if (!formToEdit) return;

    setFormData({
      formName: formToEdit.formName || "",
      eventId: formToEdit.eventId || "",
      selectedFields: [],
    });
    setSelectedCategories(formToEdit.selectedCategories || []);
    setAlignment(formToEdit.alignment || "center");
    setStep(1);
    setInitializedFromEdit(false);
  }, [formToEdit]);

  // Filter to show only active events (current date within event date range)
  const today = new Date().toISOString().slice(0, 10);
  const activeEvents = events.filter(
    (e) => e.startDate <= today && e.endDate >= today,
  );

  const selectedEvent = events.find(
    (e) => e.id === formData.eventId || e._id === formData.eventId,
  );

  const eventOptions = formToEdit ? events : activeEvents;

  // Get ONLY enabled fields from the selected event
  const eventFields =
    selectedEvent?.attendeeFields?.filter(
      (field) =>
        field && (field.fieldName || field.label) && field.enabled !== false,
    ) || [];

  // Auto-select all currently enabled event fields when an event is chosen
  useEffect(() => {
    if (!selectedEvent) {
      setSelectedFields([]);
      return;
    }

    if (formToEdit && !initializedFromEdit) {
      const selectedFieldIndexes = eventFields
        .map((field, idx) => {
          const match = formToEdit.fields?.find(
            (f) => f.fieldId === field.fieldId || f.label === field.label,
          );
          return match?.enabled !== false ? idx : null;
        })
        .filter((idx) => idx !== null);
      setSelectedFields(selectedFieldIndexes);
      setInitializedFromEdit(true);
      return;
    }

    const enabledFieldIndexes = selectedEvent.attendeeFields
      .filter(
        (field) =>
          field && (field.fieldName || field.label) && field.enabled !== false,
      )
      .map((_, idx) => idx);

    setSelectedFields(enabledFieldIndexes);
  }, [
    selectedEvent?.id,
    selectedEvent?.attendeeFields?.length,
    (selectedEvent?.attendeeFields?.map((field) => field?.enabled) || []).join(
      ",",
    ),
    formToEdit,
    initializedFromEdit,
  ]);

  // Use categories defined on the selected event only
  const eventCategories =
    selectedEvent?.categories?.filter(
      (category) => category?.enabled !== false,
    ) || [];

  // Auto-select currently enabled event categories when an event is chosen
  useEffect(() => {
    if (!selectedEvent) {
      setSelectedCategories([]);
      return;
    }

    if (formToEdit && !initializedFromEdit) {
      const selectedCategoryIds = selectedEvent.categories
        .filter((category) => category?.enabled !== false)
        .map((category) => category.categoryId || category.id || category._id)
        .filter((id) => (formToEdit.selectedCategories || []).includes(id));

      setSelectedCategories(selectedCategoryIds);
      setInitializedFromEdit(true);
      return;
    }

    const enabledCategoryIds = selectedEvent.categories
      .filter((category) => category?.enabled !== false)
      .map((category) => category.categoryId || category.id || category._id);

    setSelectedCategories(enabledCategoryIds);
  }, [
    selectedEvent?.id,
    selectedEvent?.categories?.length,
    (selectedEvent?.categories || []).map((cat) => cat?.enabled).join(","),
    formToEdit,
    initializedFromEdit,
  ]);

  // Map field names to proper types
  const getFieldType = (fieldName) => {
    const nameMap = {
      "Mobile Number": "number",
      Email: "text",
      Organization: "text",
      Name: "text",
      Phone: "number",
    };
    return nameMap[fieldName] || "text";
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.formName.trim()) newErrors.formName = "Form name is required";
    if (!formData.eventId) newErrors.eventId = "Event selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCreateForm = async () => {
    setLoading(true);
    setCreateError("");
    try {
      // Mark selected fields as enabled, others as disabled
      const formFields = eventFields.map((field, idx) => ({
        ...field,
        enabled: selectedFields.includes(idx),
      }));

      const payload = {
        formName: formData.formName,
        eventId: formData.eventId,
        eventName: selectedEvent?.eventName || "",
        description: formToEdit?.description || "",
        createdBy: user?.name || "System",
        fields: formFields,
        selectedCategories: selectedCategories,
        alignment: alignment,
      };

      const newForm = formToEdit
        ? await updateForm(formToEdit.id, payload)
        : await createForm(payload);

      setCurrentForm(newForm);
      onFormCreated && onFormCreated(newForm);
      setSelectedCategories([]);
      setSelectedFields([]);

      // Close modal will be handled by parent since we're transitioning to editor
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      setCreateError(
        `Failed to ${formToEdit ? "save" : "create"} form: ${error.message}`,
      );
      alert(
        `Failed to ${formToEdit ? "save" : "create"} form: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{
        background: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-lg" style={{ maxWidth: "600px" }}>
        <div className="modal-content border-0 shadow-lg">
          {/* Header */}
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">
              {formToEdit ? "Edit Form" : "Create New Form"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {step === 1 ? (
              <div>
                {/* Form Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Form Name</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.formName ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., Registration Form"
                    value={formData.formName}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        formName: e.target.value,
                      }));
                      if (errors.formName) {
                        setErrors((prev) => ({
                          ...prev,
                          formName: "",
                        }));
                      }
                    }}
                  />
                  {errors.formName && (
                    <div className="invalid-feedback d-block">
                      {errors.formName}
                    </div>
                  )}
                </div>

                {/* Choose Event */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Choose Event</label>
                  <select
                    className={`form-select ${
                      errors.eventId ? "is-invalid" : ""
                    }`}
                    value={formData.eventId}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        eventId: e.target.value,
                      }));
                      if (errors.eventId) {
                        setErrors((prev) => ({
                          ...prev,
                          eventId: "",
                        }));
                      }
                      setSelectedFields([]);
                    }}
                  >
                    <option value="">Select an event...</option>
                    {eventOptions.map((event) => (
                      <option
                        key={event.id || event._id}
                        value={event.id || event._id}
                      >
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                  {errors.eventId && (
                    <div className="invalid-feedback d-block">
                      {errors.eventId}
                    </div>
                  )}
                </div>

                {selectedEvent && (
                  <div>
                    {/* Categories Section */}
                    {eventCategories.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Categories
                        </label>
                        <div
                          className="p-2 border rounded"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          {eventCategories.map((category) => {
                            const categoryId =
                              category.categoryId ||
                              category.id ||
                              category._id;
                            return (
                              <div key={categoryId} className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`category-${categoryId}`}
                                  checked={selectedCategories.includes(
                                    categoryId,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCategories((prev) => [
                                        ...prev,
                                        categoryId,
                                      ]);
                                    } else {
                                      setSelectedCategories((prev) =>
                                        prev.filter((c) => c !== categoryId),
                                      );
                                    }
                                  }}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`category-${categoryId}`}
                                >
                                  {category.label ||
                                    category.categoryName ||
                                    category.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fields Section */}
                    {eventFields.length > 0 ? (
                      <div className="mb-2">
                        <label className="form-label fw-semibold">
                          Available Fields - Select to Include
                        </label>
                        <div
                          className="p-2 border rounded"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          {eventFields.map((field, idx) => (
                            <div key={idx} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`field-${idx}`}
                                checked={selectedFields.includes(idx)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFields((prev) => [...prev, idx]);
                                  } else {
                                    setSelectedFields((prev) =>
                                      prev.filter((f) => f !== idx),
                                    );
                                  }
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`field-${idx}`}
                              >
                                {field.fieldName || field.label}
                                <span className="ms-2 badge bg-light text-dark">
                                  {getFieldType(field.fieldName || field.label)}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      selectedEvent && (
                        <div className="alert alert-info small mb-0">
                          No fields available for this event
                        </div>
                      )
                    )}

                    {/* Form Alignment */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Form Alignment
                      </label>
                      <div className="d-flex gap-2">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            onClick={() => setAlignment(align)}
                            className={`btn btn-sm ${
                              alignment === align
                                ? "btn-primary"
                                : "btn-outline-secondary"
                            }`}
                            style={{
                              flex: 1,
                              textTransform: "capitalize",
                            }}
                          >
                            {align === "left" && "⬅ Left"}
                            {align === "center" && "⬆ Center"}
                            {align === "right" && "Right ➡"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">Form Summary</h6>
                  <div className="p-3 bg-light rounded">
                    <div className="mb-2">
                      <span className="text-muted">Form Name:</span>
                      <div className="fw-semibold">{formData.formName}</div>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Event:</span>
                      <div className="fw-semibold">
                        {selectedEvent?.eventName}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Selected Fields:</span>
                      <div className="fw-semibold">
                        {selectedFields.length > 0
                          ? selectedFields
                              .map(
                                (idx) =>
                                  eventFields[idx]?.fieldName ||
                                  eventFields[idx]?.label,
                              )
                              .join(", ")
                          : "No fields selected"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted">Categories:</span>
                      <div className="fw-semibold">
                        {selectedCategories.length > 0
                          ? selectedCategories.length + " category(ies)"
                          : "None"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="alert alert-info small mb-0">
                  Click "Create Form" to proceed to the form editor where you
                  can design the layout and customize field properties.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateForm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {formToEdit ? "Saving..." : "Creating..."}
                  </>
                ) : formToEdit ? (
                  "Save Form"
                ) : (
                  "Create Form"
                )}
              </button>
            )}
          </div>
          {createError && (
            <div className="alert alert-danger m-3 mb-0 py-2 px-3 small">
              {createError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFormModal;
