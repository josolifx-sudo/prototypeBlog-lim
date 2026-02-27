/*
  Endpoint smoke test.

  Usage:
    node scripts/testEndpoints.js

  Optional env:
    BASE_URL=http://localhost:4000

  Notes:
    - This script creates a new user each run.
    - Admin routes require an admin token; those are skipped unless ADMIN_TOKEN is provided.
*/

const crypto = require("crypto");

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

async function req(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data };
}

function logStep(name, result) {
  const badge = result.ok ? "OK" : "FAIL";
  console.log(`[${badge}] ${name} (status ${result.status})`);
  if (!result.ok) console.log(result.data);
}

(async () => {
  console.log(`BASE_URL: ${BASE_URL}`);

  // 1) Health
  const health = await req("/");
  logStep("GET /", health);

  // 2) Register
  const suffix = crypto.randomBytes(4).toString("hex");
  const email = `test_${suffix}@mail.com`;
  const username = `test_${suffix}`;
  const password = "123456";

  const reg = await req("/api/auth/register", {
    method: "POST",
    body: { email, username, password }
  });
  logStep("POST /api/auth/register", reg);

  const token = reg.data?.token;
  if (!token) {
    console.log("No token returned. Stopping tests.");
    process.exit(1);
  }

  // 3) Login
  const login = await req("/api/auth/login", {
    method: "POST",
    body: { email, password }
  });
  logStep("POST /api/auth/login", login);

  // 4) Me
  const me = await req("/api/auth/me", { token });
  logStep("GET /api/auth/me", me);

  // 5) List posts
  const list = await req("/api/posts");
  logStep("GET /api/posts", list);

  // 6) Create post
  const created = await req("/api/posts", {
    method: "POST",
    token,
    body: { title: `Hello ${suffix}`, content: "This is a test post." }
  });
  logStep("POST /api/posts", created);

  const postId = created.data?.post?._id;
  if (!postId) {
    console.log("No post id returned. Stopping tests.");
    process.exit(1);
  }

  // 7) Single post
  const single = await req(`/api/posts/${postId}`);
  logStep("GET /api/posts/:id", single);

  // 8) Add comment
  const addedComment = await req(`/api/posts/${postId}/comments`, {
    method: "POST",
    token,
    body: { content: "Nice post." }
  });
  logStep("POST /api/posts/:postId/comments", addedComment);

  const commentId = addedComment.data?.comment?._id;

  // 9) Delete comment
  if (commentId) {
    const delComment = await req(`/api/comments/${commentId}`, {
      method: "DELETE",
      token
    });
    logStep("DELETE /api/comments/:id", delComment);
  } else {
    console.log("[SKIP] DELETE /api/comments/:id (no comment id)");
  }

  // 10) Delete post
  const delPost = await req(`/api/posts/${postId}`, {
    method: "DELETE",
    token
  });
  logStep("DELETE /api/posts/:id", delPost);

  // Admin routes (optional)
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const users = await req("/api/users", { token: adminToken });
    logStep("GET /api/users (admin)", users);
  } else {
    console.log("[SKIP] Admin routes (set ADMIN_TOKEN to test)");
  }

  console.log("Done.");
})().catch((e) => {
  console.error("Test runner error:", e);
  process.exit(1);
});
