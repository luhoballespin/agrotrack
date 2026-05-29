const mongoose = require("mongoose");
const dns = require("dns");
const {
  buildUriFromGoogleDns,
  convertSrvToDirect,
  isSrvDnsError,
  isIpWhitelistError,
} = require("../utils/mongoUri");

if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

async function tryConnect(uri, options) {
  await mongoose.connect(uri, options);
  console.log("MongoDB conectado:", mongoose.connection.host);
  return mongoose.connection;
}

async function connectDB() {
  const srvUri = process.env.MONGODB_URI?.trim();
  const standardUri = process.env.MONGODB_URI_STANDARD?.trim();

  if (!srvUri && !standardUri) {
    throw new Error("Falta MONGODB_URI en backend/.env");
  }

  mongoose.set("strictQuery", true);
  const options = { serverSelectionTimeoutMS: 25000 };

  const attempts = [];

  if (standardUri) attempts.push({ label: "MONGODB_URI_STANDARD", uri: standardUri });
  if (srvUri) attempts.push({ label: "MONGODB_URI (SRV)", uri: srvUri });

  let lastError;

  for (const { label, uri } of attempts) {
    try {
      return await tryConnect(uri, options);
    } catch (err) {
      lastError = err;
      console.warn(`Falló ${label}:`, err.message);

      if (uri.startsWith("mongodb+srv://") && isSrvDnsError(err)) {
        try {
          console.warn("Resolviendo Atlas vía DNS Google (8.8.8.8)...");
          const resolved = await buildUriFromGoogleDns(uri);
          return await tryConnect(resolved, options);
        } catch (errDns) {
          lastError = errDns;
          console.warn("DNS Google:", errDns.message);
        }

        try {
          console.warn("Reintentando host único directo...");
          const direct = convertSrvToDirect(uri);
          return await tryConnect(direct, options);
        } catch (errDirect) {
          lastError = errDirect;
          console.warn("Directo:", errDirect.message);
        }
      }
    }
  }

  if (isIpWhitelistError(lastError)) {
    console.error("\n══════════════════════════════════════════════════");
    console.error("  ATLAS: tu IP no está permitida (Network Access)");
    console.error("  1. https://cloud.mongodb.com → Network Access");
    console.error("  2. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)");
    console.error("  3. Esperar 1-2 min y volver a ejecutar npm run seed");
    console.error("══════════════════════════════════════════════════\n");
  }

  throw lastError;
}

module.exports = { connectDB };
