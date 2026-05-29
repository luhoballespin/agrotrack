const dns = require("dns");

function parseSrvUri(srvUri) {
  if (!srvUri?.startsWith("mongodb+srv://")) {
    throw new Error("Se esperaba una URI mongodb+srv://");
  }
  const rest = srvUri.slice("mongodb+srv://".length);
  const qIndex = rest.indexOf("?");
  const base = qIndex >= 0 ? rest.slice(0, qIndex) : rest;
  const query = qIndex >= 0 ? rest.slice(qIndex + 1) : "";

  const slashIndex = base.indexOf("/");
  const authority = slashIndex >= 0 ? base.slice(0, slashIndex) : base;
  const dbPath = slashIndex >= 0 ? base.slice(slashIndex + 1) : "";

  const atIndex = authority.lastIndexOf("@");
  const credentials = atIndex >= 0 ? authority.slice(0, atIndex + 1) : "";
  const host = atIndex >= 0 ? authority.slice(atIndex + 1) : authority;

  return { credentials, host, database: dbPath, query };
}

/**
 * Resuelve hosts reales del cluster Atlas usando DNS público (8.8.8.8).
 * Útil cuando Windows/red corporativa bloquea querySrv local.
 */
async function buildUriFromGoogleDns(srvUri) {
  const { credentials, host, database, query } = parseSrvUri(srvUri);
  const resolver = new dns.promises.Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

  const srvName = `_mongodb._tcp.${host}`;
  const records = await resolver.resolveSrv(srvName);
  if (!records?.length) throw new Error("No se encontraron registros SRV para Atlas");

  const hosts = records.map((r) => `${r.name}:${r.port}`).join(",");

  let replicaSet;
  try {
    const txtRecords = await resolver.resolveTxt(srvName);
    const flat = txtRecords.flat();
    const rsLine = flat.find((t) => t.startsWith("replicaSet="));
    if (rsLine) replicaSet = rsLine.replace("replicaSet=", "").trim();
  } catch {
    /* TXT opcional */
  }

  const params = new URLSearchParams(query);
  params.set("ssl", "true");
  params.set("authSource", "admin");
  if (replicaSet) params.set("replicaSet", replicaSet);

  const db = database || "agrotrack";
  return `mongodb://${credentials}${hosts}/${db}?${params.toString()}`;
}

/** Fallback simple (un solo host) — a veces insuficiente en Atlas M0 */
function convertSrvToDirect(srvUri) {
  if (!srvUri || !srvUri.startsWith("mongodb+srv://")) return srvUri;

  const { credentials, host, database, query } = parseSrvUri(srvUri);
  const params = new URLSearchParams(query);
  params.set("ssl", "true");
  if (!params.has("authSource")) params.set("authSource", "admin");

  const hostWithPort = host.includes(":") ? host : `${host}:27017`;
  const db = database || "";
  const path = db ? `/${db}` : "";
  return `mongodb://${credentials}${hostWithPort}${path}?${params.toString()}`;
}

function isSrvDnsError(err) {
  const msg = err?.message || "";
  return msg.includes("querySrv") || err?.syscall === "querySrv";
}

function isIpWhitelistError(err) {
  const msg = err?.message || "";
  return msg.includes("whitelist") || msg.includes("IP that isn't");
}

module.exports = {
  parseSrvUri,
  buildUriFromGoogleDns,
  convertSrvToDirect,
  isSrvDnsError,
  isIpWhitelistError,
};
