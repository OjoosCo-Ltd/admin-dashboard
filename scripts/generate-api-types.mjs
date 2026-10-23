// Writes types/api-dtos.ts: the request bodies and query params of every
// backend operation the admin calls, from the staging OpenAPI spec.
//
//   npm run api:types              reads API_URL from .env.local and fetches /docs-json
//   npm run api:types -- spec.json  reads a saved copy instead
//
// The spec documents requests only, so responses stay hand-written in types/.
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "types/api-dtos.ts";

// Member routes the admin also calls. Everything under /admin is included.
const MEMBER_OPERATIONS = new Set([
  "GET /health",
  "GET /images",
  "GET /profile/me",
  "PATCH /profile/me",
  "POST /auth/password-reset/request",
  "POST /auth/password-reset/verify-otp",
  "POST /auth/password-reset/reset",
  "GET /verification/requirements/{documentType}",
  "POST /chat/media/signed-urls",
  "GET /community/groups",
  "GET /community/groups/{groupId}",
  "GET /community/groups/{groupId}/events",
  "POST /community/groups/{groupId}/events",
  "GET /community/events",
  "GET /community/events/{eventId}",
  "PATCH /community/events/{eventId}",
  "DELETE /community/events/{eventId}",
  "GET /community/events/{eventId}/tickets",
  "GET /community/posts/{postId}",
  "GET /community/posts/{postId}/replies",
  "GET /community/myposts/reports",
  "POST /community/media/signed-urls",
]);

// Unions already named in types/api.ts, matched by their exact values.
const SHARED_UNIONS = {
  UserRole: ["User", "Admin", "Moderator"],
  AccountStatus: ["ACTIVE", "PAUSED", "SUSPENDED", "DELETED"],
  OnboardingStatus: ["IN_PROGRESS", "COMPLETED"],
  VerificationStatus: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"],
  ReportStatus: ["PENDING", "REVIEWED", "ACTIONED", "DISMISSED"],
  StatsPeriod: ["day", "week", "month"],
  SortOrder: ["asc", "desc"],
};
// Fields the spec gets wrong, corrected by hand.
const OVERRIDES = {
  // The spec says an array of arrays; its own example, and what the app sends, is strings.
  "SignMediaUrlsDto.paths": "string[]",
};

const sharedByValues = new Map(
  Object.entries(SHARED_UNIONS).map(([name, values]) => [[...values].sort().join("|"), name]),
);

async function loadSpec() {
  const file = process.argv[2];
  if (file) return JSON.parse(readFileSync(file, "utf8"));
  const env = readFileSync(".env.local", "utf8");
  const apiUrl = env
    .match(/^API_URL=(.+)$/m)?.[1]
    ?.trim()
    .replace(/\/+$/, "");
  if (!apiUrl) throw new Error("API_URL is not set in .env.local");
  const res = await fetch(`${apiUrl}/docs-json`);
  if (!res.ok) throw new Error(`GET ${apiUrl}/docs-json failed: ${res.status}`);
  return res.json();
}

const spec = await loadSpec();
const schemas = spec.components?.schemas ?? {};
const usedShared = new Set();
const dtoQueue = [];
const dtoSeen = new Set();

function refName(ref) {
  return ref.split("/").pop();
}

function tsType(schema) {
  if (!schema) return "unknown";
  if (schema.$ref) {
    const name = refName(schema.$ref);
    if (!dtoSeen.has(name)) {
      dtoSeen.add(name);
      dtoQueue.push(name);
    }
    return name;
  }
  if (schema.enum) {
    const shared = sharedByValues.get([...schema.enum].map(String).sort().join("|"));
    if (shared) {
      usedShared.add(shared);
      return shared;
    }
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  }
  if (schema.allOf?.length === 1) return tsType(schema.allOf[0]);
  if (schema.oneOf || schema.anyOf) return (schema.oneOf ?? schema.anyOf).map(tsType).join(" | ");
  switch (schema.type) {
    case "string":
      return schema.format === "binary" ? "Blob" : "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array": {
      const item = tsType(schema.items);
      return item.includes(" ") ? `(${item})[]` : `${item}[]`;
    }
    case "object":
      return schema.properties ? inlineObject(schema) : "Record<string, unknown>";
    default:
      return "unknown";
  }
}

function inlineObject(schema) {
  const required = new Set(schema.required ?? []);
  const fields = Object.entries(schema.properties ?? {}).map(
    ([key, value]) => `${key}${required.has(key) ? "" : "?"}: ${tsType(value)}`,
  );
  return `{ ${fields.join("; ")} }`;
}

function docLine(text, indent = "") {
  const clean = String(text).replace(/\s+/g, " ").replace(/\*\//g, "*\\/").trim();
  return clean ? `${indent}/** ${clean} */\n` : "";
}

function fieldLines(properties, required, owner) {
  return Object.entries(properties ?? {})
    .map(([key, value]) => {
      const notes = [
        value.description,
        value.example !== undefined && `e.g. ${JSON.stringify(value.example)}`,
      ]
        .filter(Boolean)
        .join(". ");
      const optional = required.has(key) ? "" : "?";
      const type = (owner && OVERRIDES[`${owner}.${key}`]) ?? tsType(value);
      return `${docLine(notes, "  ")}  ${key}${optional}: ${type};`;
    })
    .join("\n");
}

function pascal(text) {
  return text.replace(/(^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase());
}

const operations = [];
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const method of ["get", "post", "put", "patch", "delete"]) {
    const op = item[method];
    if (!op) continue;
    const key = `${method.toUpperCase()} ${path}`;
    if (!path.includes("/admin") && !MEMBER_OPERATIONS.has(key)) continue;
    operations.push({ key, op });
  }
}

const queryBlocks = [];
for (const { key, op } of operations) {
  const query = (op.parameters ?? []).filter((param) => param.in === "query");
  for (const body of Object.values(op.requestBody?.content ?? {})) tsType(body.schema);
  if (!query.length) continue;
  const name = `${pascal(op.operationId.split("_").pop())}Query`;
  const required = new Set(query.filter((param) => param.required).map((param) => param.name));
  const properties = Object.fromEntries(
    query.map((param) => [param.name, { ...param.schema, description: param.description }]),
  );
  queryBlocks.push(
    `${docLine(`Query params of ${key}.`)}export interface ${name} {\n${fieldLines(properties, required)}\n}`,
  );
}

const dtoBlocks = [];
while (dtoQueue.length) {
  const name = dtoQueue.shift();
  const schema = schemas[name] ?? {};
  const required = new Set(schema.required ?? []);
  if (!schema.properties || !Object.keys(schema.properties).length) {
    dtoBlocks.push(
      `${docLine(`${name}: the spec documents no properties.`)}export type ${name} = Record<string, unknown>;`,
    );
    continue;
  }
  dtoBlocks.push(
    `${docLine(schema.description ?? "")}export interface ${name} {\n${fieldLines(schema.properties, required, name)}\n}`,
  );
}
dtoBlocks.sort((a, b) =>
  a.match(/(interface|type) (\w+)/)[2].localeCompare(b.match(/(interface|type) (\w+)/)[2]),
);

const header = `// Generated by scripts/generate-api-types.mjs from the staging OpenAPI spec
// (${spec.info?.title ?? "API"} ${spec.info?.version ?? ""}). Don't edit by hand: run \`npm run api:types\`.
//
// Request bodies and query params only. The spec documents no response
// bodies, so response types are written by hand in types/<domain>.ts.
`;
const imports = usedShared.size
  ? `\nimport type { ${[...usedShared].sort().join(", ")} } from "@/types/api";\n`
  : "";
writeFileSync(OUT, `${header}${imports}\n${[...dtoBlocks, ...queryBlocks].join("\n\n")}\n`);
console.log(
  `wrote ${OUT}: ${dtoBlocks.length} request bodies, ${queryBlocks.length} query param sets`,
);
