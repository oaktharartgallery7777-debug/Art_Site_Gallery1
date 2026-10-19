const client = {
  async request(path, options = {}) {
    const res = await fetch(path, { credentials: "include", ...options });
    if (res.status === 401 && !path.startsWith("/api/auth")) {
      window.location.href = "/admin/login";
      throw new Error("Not authenticated");
    }
    return res;
  },
  async get(path) {
    const res = await this.request(path);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`);
    return res.json();
  },
  async post(path, body) {
    const res = await this.request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`);
    return res.json();
  },
  async put(path, body) {
    const res = await this.request(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`);
    return res.json();
  },
  async del(path) {
    const res = await this.request(path, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`);
    return res.json();
  },
  async postForm(path, formData) {
    const res = await this.request(path, { method: "POST", body: formData });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`);
    return res.json();
  },
  async download(path, filename) {
    const res = await this.request(path);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  },
};

export const api = {
  // public
  paintings: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
    return client.get(`/api/paintings?${q}`);
  },
  painting: (id) => client.get(`/api/paintings/${encodeURIComponent(id)}`),
  filterOptions: () => client.get("/api/paintings/filter-options"),
  artists: () => client.get("/api/paintings/artists"),
  // auth
  login: (password) => client.post("/api/auth/login", { password }),
  logout: () => client.post("/api/auth/logout", {}),
  me: () => client.get("/api/auth/me"),
  // admin
  createPainting: (formData) => client.postForm("/api/paintings", formData),
  updatePainting: (id, body) => client.put(`/api/paintings/${encodeURIComponent(id)}`, body),
  deletePainting: (id) => client.del(`/api/paintings/${encodeURIComponent(id)}`),
  replaceImage: (id, formData) => client.postForm(`/api/paintings/${encodeURIComponent(id)}/replace-image`, formData),
  batchLocation: (ids, location) => client.post("/api/paintings/batch-location", { artwork_ids: ids, new_location: location }),
  analytics: () => client.get("/api/analytics"),
  activity: (page = 1) => client.get(`/api/activity?page=${page}`),
  bulkImport: (formData) => client.postForm("/api/tools/bulk-import", formData),
  importTemplate: () => client.download("/api/tools/import-template", "bulk-import-template.csv"),
  labelsPdf: (ids) => client.download(`/api/tools/labels.pdf?ids=${ids.join(",")}`, "art-labels.pdf"),
  qrUrl: (id) => `/api/tools/qr/${encodeURIComponent(id)}`,
};
