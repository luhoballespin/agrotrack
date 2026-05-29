function ok(res, data, message = "OK") {
  return res.json({ success: true, data, message });
}

function fail(res, status, message, data = null) {
  return res.status(status).json({ success: false, data, message });
}

module.exports = { ok, fail };

