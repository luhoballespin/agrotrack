function getOwnerId(req) {
  return String(req?.user?.sub || "");
}

function ownerFilter(req, extra = {}) {
  return { ...extra, ownerId: getOwnerId(req) };
}

module.exports = { getOwnerId, ownerFilter };
