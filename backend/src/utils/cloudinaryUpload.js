const { cloudinary } = require("../config/cloudinary");

function bufferToDataUri(buffer, mimetype) {
  const b64 = buffer.toString("base64");
  return `data:${mimetype};base64,${b64}`;
}

async function uploadImageFromMulter(file, folder = "agrotrack") {
  if (!file) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("Cloudinary no configurado: se omite subida de foto");
    return null;
  }
  try {
    const dataUri = bufferToDataUri(file.buffer, file.mimetype || "image/jpeg");
    const res = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
    });
    return res.secure_url;
  } catch (e) {
    console.error("Error subiendo a Cloudinary:", e.message);
    return null;
  }
}

module.exports = { uploadImageFromMulter };

