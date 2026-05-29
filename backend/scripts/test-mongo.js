const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const dns = require("dns");
const {
  buildUriFromGoogleDns,
  convertSrvToDirect,
  isSrvDnsError,
  isIpWhitelistError,
} = require("../src/utils/mongoUri");

if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

const srvUri = process.env.MONGODB_URI?.trim();
const standardUri = process.env.MONGODB_URI_STANDARD?.trim();

if (!srvUri && !standardUri) {
  console.error("❌ Falta MONGODB_URI en backend/.env");
  process.exit(1);
}

const options = { serverSelectionTimeoutMS: 25000 };

function mask(uri) {
  return uri.replace(/:[^:@]+@/, ":****@");
}

async function testUri(label, uri) {
  console.log(`\n→ ${label}`);
  console.log("  ", mask(uri));
  await mongoose.connect(uri, options);
  console.log("✅ Conexión OK →", mongoose.connection.host);
  console.log("   Base de datos:", mongoose.connection.name);
  await mongoose.disconnect();
}

(async () => {
  console.log("Probando conexión a MongoDB Atlas...");
  try {
    if (standardUri) await testUri("MONGODB_URI_STANDARD", standardUri);
    else if (srvUri) {
      try {
        await testUri("SRV", srvUri);
      } catch (err) {
        if (!isSrvDnsError(err)) throw err;
        console.warn("SRV local bloqueado, probando DNS Google...");
        const resolved = await buildUriFromGoogleDns(srvUri);
        await testUri("Resuelto vía 8.8.8.8", resolved);
        console.log("\n💡 Agregá en backend/.env para no depender del fallback:");
        console.log("MONGODB_URI_STANDARD=" + mask(resolved));
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("\n❌", err.message);
    if (isIpWhitelistError(err)) {
      console.log("\n🔧 Solución: Atlas → Network Access → Add IP → 0.0.0.0/0 (Allow from anywhere)");
      console.log("   Esperá 1-2 minutos y ejecutá de nuevo: npm run test:db");
    }
    process.exit(1);
  }
})();
