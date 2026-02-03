import { inferFieldType } from "./dashboard.js";

export const normalizeKey = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

export const parseCsvText = (text) => {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  const pushRow = () => {
    currentRow.push(currentValue);
    currentValue = "";
    if (currentRow.some((cell) => String(cell).trim() !== "")) {
      rows.push(currentRow);
    }
    currentRow = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "\"") {
      const nextChar = text[index + 1];
      if (inQuotes && nextChar === "\"") {
        currentValue += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      pushRow();
    } else {
      currentValue += char;
    }
  }

  currentRow.push(currentValue);
  if (currentRow.some((cell) => String(cell).trim() !== "")) {
    rows.push(currentRow);
  }

  if (!rows.length) {
    return { headers: [], records: [] };
  }

  const headerRow = rows[0];
  const headers = headerRow.map((header) => String(header ?? "").trim());
  const records = rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, idx) => {
      if (!header) return;
      record[header] = String(row[idx] ?? "").trim();
    });
    return record;
  });

  return { headers, records };
};

export const parseJsonText = (text) => {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.records)) return parsed.records;
    if (Array.isArray(parsed.leads)) return parsed.leads;
    if (Array.isArray(parsed.deals)) return parsed.deals;
  }
  throw new Error("JSON must be an array or object with records/leads/deals.");
};

export const parseImportText = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return { format: "empty", records: [] };
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return { format: "json", records: parseJsonText(trimmed) };
  }
  const { records } = parseCsvText(trimmed);
  return { format: "csv", records };
};

export const buildAliasLookup = (objectType, aliases = {}) => {
  const lookup = {};
  if (!objectType) return lookup;
  objectType.properties.forEach((prop) => {
    lookup[normalizeKey(prop)] = prop;
  });
  Object.entries(aliases).forEach(([prop, aliasList]) => {
    aliasList.forEach((alias) => {
      lookup[normalizeKey(alias)] = prop;
    });
  });
  return lookup;
};

export const mapRecordToSchema = (record, aliasLookup) => {
  const mapped = {};
  const unknownKeys = [];
  Object.entries(record || {}).forEach(([key, value]) => {
    const canonical = aliasLookup[normalizeKey(key)];
    if (!canonical) {
      unknownKeys.push(key);
      return;
    }
    mapped[canonical] = value;
  });
  return { mapped, unknownKeys };
};

export const coerceValue = (value, fieldType) => {
  if (value === null || value === undefined) return value;
  if (fieldType === "number") {
    if (typeof value === "number") return value;
    const raw = String(value).trim();
    if (!raw) return "";
    const isPercent = raw.endsWith("%");
    const cleaned = raw.replace(/[%$,]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      return isPercent ? parsed / 100 : parsed;
    }
    return value;
  }
  if (fieldType === "boolean") {
    if (typeof value === "boolean") return value;
    const normalized = String(value).trim().toLowerCase();
    if (["true", "yes", "1"].includes(normalized)) return true;
    if (["false", "no", "0"].includes(normalized)) return false;
    return value;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

export const coerceRecordValues = (record, objectType) => {
  if (!objectType) return record;
  const coerced = { ...record };
  objectType.properties.forEach((prop) => {
    if (!(prop in record)) return;
    const fieldType = inferFieldType(prop, objectType.field_overrides || {});
    coerced[prop] = coerceValue(record[prop], fieldType);
  });
  return coerced;
};

export const buildNormalizedLookup = (record) => {
  const lookup = {};
  Object.entries(record || {}).forEach(([key, value]) => {
    lookup[normalizeKey(key)] = value;
  });
  return lookup;
};

export const getFirstLookupValue = (lookup, keys = []) => {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (lookup[normalized]) return lookup[normalized];
  }
  return "";
};
