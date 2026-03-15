import { Timestamp } from "firebase-admin/firestore";

function serializeValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeValue(nestedValue)])
    );
  }

  return value;
}

export function serializeDocument<T>(id: string, data: Record<string, unknown>) {
  const serialized = serializeValue(data) as Record<string, unknown>;

  return {
    ...serialized,
    id
  } as T & { id: string };
}
