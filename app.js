import { initialData } from "./data.js";

const state = structuredClone(initialData);
const pristine = structuredClone(initialData);

const companyNameEl = document.getElementById("company-name");
const primaryObjectiveEl = document.getElementById("primary-objective");
const fdeLeadEl = document.getElementById("fde-lead");
const deploymentTimelineEl = document.getElementById("deployment-timeline");
const summaryGridEl = document.getElementById("summary-grid");
const valueActionsEl = document.getElementById("value-actions");
const jsonOutputEl = document.getElementById("json-output");

const clientMetadataSection = document.getElementById("client-metadata");
const semanticLayerSection = document.getElementById("semantic-layer");
const kineticLayerSection = document.getElementById("kinetic-layer");
const dataIntegrationSection = document.getElementById("data-integration");

const downloadButton = document.getElementById("download-json");
const resetButton = document.getElementById("reset-data");

const isPrimitive = (value) =>
  value === null || ["string", "number", "boolean"].includes(typeof value);

const clone = (value) => JSON.parse(JSON.stringify(value));

const updateHeader = () => {
  companyNameEl.textContent = state.client_metadata.company_name || "Client Value Dashboard";
  primaryObjectiveEl.textContent = state.client_metadata.primary_objective || "";
  fdeLeadEl.textContent = state.client_metadata.fde_lead || "—";
  deploymentTimelineEl.textContent = state.client_metadata.deployment_timeline || "—";
};

const updateJsonOutput = () => {
  jsonOutputEl.value = JSON.stringify(state, null, 2);
};

const renderSummary = () => {
  summaryGridEl.innerHTML = "";
  const tiles = [
    {
      label: "Object types",
      value: state.semantic_layer.object_types.length,
    },
    {
      label: "Link types",
      value: state.semantic_layer.link_types.length,
    },
    {
      label: "Kinetic functions",
      value: state.kinetic_layer.functions.length,
    },
    {
      label: "Action types",
      value: state.kinetic_layer.action_types.length,
    },
    {
      label: "Data sources",
      value: state.data_integration_mapping.sources.length,
    },
  ];

  tiles.forEach((tile) => {
    const tileEl = document.createElement("div");
    tileEl.className = "summary-tile";
    tileEl.innerHTML = `<span class="label">${tile.label}</span><strong>${tile.value}</strong>`;
    summaryGridEl.appendChild(tileEl);
  });

  valueActionsEl.innerHTML = `
    <h3 class="section-title">Value actions</h3>
    ${state.kinetic_layer.action_types
      .map(
        (action) => `
        <div class="summary-tile">
          <strong>${action.id}</strong>
          <p>${action.description}</p>
        </div>
      `
      )
      .join("")}
  `;
};

const createField = (label, value, path) => {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";

  const labelEl = document.createElement("label");
  labelEl.textContent = label.replace(/_/g, " ");
  wrapper.appendChild(labelEl);

  if (typeof value === "boolean") {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = value;
    input.addEventListener("change", () => {
      setValue(path, input.checked);
    });
    wrapper.appendChild(input);
    return wrapper;
  }

  if (typeof value === "number") {
    const input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.addEventListener("input", () => {
      const nextValue = input.value === "" ? "" : Number(input.value);
      setValue(path, nextValue);
    });
    wrapper.appendChild(input);
    return wrapper;
  }

  if (Array.isArray(value)) {
    if (value.every((item) => isPrimitive(item))) {
      const textarea = document.createElement("textarea");
      textarea.value = value.join("\n");
      textarea.addEventListener("input", () => {
        const nextValue = textarea.value
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        setValue(path, nextValue);
      });
      wrapper.appendChild(textarea);
      return wrapper;
    }

    const listWrapper = document.createElement("div");
    listWrapper.className = "card-grid";

    value.forEach((item, index) => {
      const itemCard = document.createElement("div");
      itemCard.className = "object-card";
      const header = document.createElement("header");
      const title = document.createElement("strong");
      const titleKey = item.id || item.name || `Item ${index + 1}`;
      title.textContent = titleKey;
      const removeButton = document.createElement("button");
      removeButton.className = "danger";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        const current = getValue(path);
        current.splice(index, 1);
        setValue(path, current, true);
      });
      header.appendChild(title);
      header.appendChild(removeButton);
      itemCard.appendChild(header);

      const fields = renderObjectFields(item, [...path, index]);
      itemCard.appendChild(fields);
      listWrapper.appendChild(itemCard);
    });

    const addButton = document.createElement("button");
    addButton.className = "primary";
    addButton.textContent = "Add item";
    addButton.addEventListener("click", () => {
      const current = getValue(path);
      const template = current[0] || {};
      current.push(createEmptyItem(template));
      setValue(path, current, true);
    });

    wrapper.appendChild(listWrapper);
    wrapper.appendChild(addButton);
    return wrapper;
  }

  const input = value && value.length > 90 ? document.createElement("textarea") : document.createElement("input");
  input.value = value ?? "";
  input.addEventListener("input", () => {
    setValue(path, input.value);
  });
  wrapper.appendChild(input);
  return wrapper;
};

const renderObjectFields = (obj, path) => {
  const container = document.createElement("div");
  Object.entries(obj).forEach(([key, value]) => {
    container.appendChild(createField(key, value, [...path, key]));
  });
  return container;
};

const createEmptyItem = (template) => {
  if (Array.isArray(template)) {
    return [];
  }
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, []];
        }
        if (typeof value === "boolean") {
          return [key, false];
        }
        if (typeof value === "number") {
          return [key, 0];
        }
        if (value && typeof value === "object") {
          return [key, createEmptyItem(value)];
        }
        return [key, ""]; // string or null
      })
    );
  }
  return "";
};

const getValue = (path) => path.reduce((acc, key) => acc[key], state);

const setValue = (path, value, rerender = false) => {
  let cursor = state;
  path.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[path[path.length - 1]] = value;
  updateJsonOutput();
  updateHeader();
  if (rerender) {
    renderAll();
  }
};

const renderSectionHeader = (title, description) => {
  const wrapper = document.createElement("div");
  wrapper.className = "card-header";
  const heading = document.createElement("h2");
  heading.textContent = title;
  wrapper.appendChild(heading);
  if (description) {
    const text = document.createElement("p");
    text.textContent = description;
    wrapper.appendChild(text);
  }
  return wrapper;
};

const renderSection = (container, title, description, data, path) => {
  container.innerHTML = "";
  container.appendChild(renderSectionHeader(title, description));
  container.appendChild(renderObjectFields(data, path));
};

const renderAll = () => {
  updateHeader();
  renderSummary();
  renderSection(
    clientMetadataSection,
    "Client metadata",
    "Client context and program objectives.",
    state.client_metadata,
    ["client_metadata"]
  );
  renderSection(
    semanticLayerSection,
    "Semantic layer",
    "Ontology object and link types powering the dashboard.",
    state.semantic_layer,
    ["semantic_layer"]
  );
  renderSection(
    kineticLayerSection,
    "Kinetic layer",
    "Derived logic and action playbooks tied to value realization.",
    state.kinetic_layer,
    ["kinetic_layer"]
  );
  renderSection(
    dataIntegrationSection,
    "Data integration mapping",
    "Source systems that hydrate the ontology and evidence base.",
    state.data_integration_mapping,
    ["data_integration_mapping"]
  );
  updateJsonOutput();
};

const downloadJson = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ontology-dashboard.json";
  anchor.click();
  URL.revokeObjectURL(url);
};

const resetData = () => {
  Object.keys(state).forEach((key) => {
    state[key] = clone(pristine[key]);
  });
  renderAll();
};

downloadButton.addEventListener("click", downloadJson);
resetButton.addEventListener("click", resetData);

renderAll();
