import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  fetchForms,
  createForm as createFormAPI,
  updateForm as updateFormAPI,
  deleteForm as deleteFormAPI,
  fetchFormTemplates,
  createFormTemplate as createFormTemplateAPI,
  deleteFormTemplate as deleteFormTemplateAPI,
} from "../services/api";

const FormContext = createContext({});

export const FormProvider = ({ children }) => {
  // Forms state
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState(null);

  // Form templates state
  const [formTemplates, setFormTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);

  // Form elements (stored locally since they're part of form)
  const [formElements, setFormElements] = useState({});
  const [currentForm, setCurrentForm] = useState(null);

  // Load forms on mount
  useEffect(() => {
    const loadForms = async () => {
      setFormsLoading(true);
      setFormsError(null);
      try {
        const data = await fetchForms();
        setForms(data);
      } catch (error) {
        setFormsError(error.message);
        console.error("Failed to load forms:", error);
      } finally {
        setFormsLoading(false);
      }
    };
    loadForms();
  }, []);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const data = await fetchFormTemplates();
        setFormTemplates(data);
      } catch (error) {
        setTemplatesError(error.message);
        console.error("Failed to load templates:", error);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Add a new form
  const createForm = useCallback(async (formData) => {
    try {
      const newForm = await createFormAPI({
        ...formData,
        elements: [],
      });
      setForms((prev) => [newForm, ...prev]);
      return newForm;
    } catch (error) {
      console.error("Failed to create form:", error);
      throw error;
    }
  }, []);

  // Update form
  const updateForm = useCallback(async (formId, updates) => {
    try {
      const updated = await updateFormAPI(formId, updates);
      setForms((prev) => prev.map((f) => (f.id === formId ? updated : f)));
      return updated;
    } catch (error) {
      console.error("Failed to update form:", error);
      throw error;
    }
  }, []);

  // Delete form
  const deleteForm = useCallback(async (formId) => {
    try {
      await deleteFormAPI(formId);
      setForms((prev) => prev.filter((f) => f.id !== formId));
      setFormElements((prev) => {
        const updated = { ...prev };
        delete updated[formId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete form:", error);
      throw error;
    }
  }, []);

  // Get form by ID
  const getFormById = useCallback(
    (formId) => forms.find((f) => f.id === formId),
    [forms],
  );

  // Save form elements (updates the form with elements)
  const saveFormElements = useCallback(async (formId, elements) => {
    try {
      setFormElements((prev) => ({
        ...prev,
        [formId]: elements,
      }));
      // Update form on backend with elements
      const updated = await updateFormAPI(formId, {
        elements,
        status: "saved",
      });
      setForms((prev) => prev.map((f) => (f.id === formId ? updated : f)));
      return updated;
    } catch (error) {
      console.error("Failed to save form elements:", error);
      throw error;
    }
  }, []);

  // Get form elements
  const getFormElements = useCallback(
    (formId) => formElements[formId] || [],
    [formElements],
  );

  // Create template from form
  const createTemplate = useCallback(
    async (formId, templateName) => {
      const form = getFormById(formId);
      if (!form) throw new Error("Form not found");

      try {
        const template = await createFormTemplateAPI({
          name: templateName,
          formId: formId,
          elements: form.elements || [],
          description: form.description || "",
        });
        setFormTemplates((prev) => [template, ...prev]);
        return template;
      } catch (error) {
        console.error("Failed to create template:", error);
        throw error;
      }
    },
    [getFormById],
  );

  // Delete template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      await deleteFormTemplateAPI(templateId);
      setFormTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (error) {
      console.error("Failed to delete template:", error);
      throw error;
    }
  }, []);

  // Load template into form
  const loadTemplate = useCallback(
    async (templateId, newFormId) => {
      const template = formTemplates.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");

      try {
        await saveFormElements(newFormId, template.elements);
        return template;
      } catch (error) {
        console.error("Failed to load template:", error);
        throw error;
      }
    },
    [formTemplates, saveFormElements],
  );

  const value = {
    // Forms
    forms,
    formsLoading,
    formsError,
    currentForm,
    setCurrentForm,
    createForm,
    updateForm,
    deleteForm,
    getFormById,

    // Form Elements
    formElements,
    saveFormElements,
    getFormElements,

    // Templates
    formTemplates,
    templatesLoading,
    templatesError,
    createTemplate,
    deleteTemplate,
    loadTemplate,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within FormProvider");
  }
  return context;
};
