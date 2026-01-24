const STORAGE_KEY = "ontology_cockpit_state_v1";

export const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse stored state", error);
    return null;
  }
};

export const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
