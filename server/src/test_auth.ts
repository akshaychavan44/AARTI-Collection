/**
 * Automated Authentication & Authorization Test Suite for Phase 3
 * Tests Registration, Login, Sessions, JWT, RBAC, Profile, and Password Reset.
 */

export {};

const BASE_URL = "http://localhost:5000/api";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

async function assert(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    results.push({ name, passed: true });
  } else {
    console.error(`❌ FAIL: ${name} - Details: ${details || "Assertion failed"}`);
    results.push({ name, passed: false, details });
  }
}

async function runAuthTests() {
  console.log("🚀 Starting Comprehensive Auth Test Suite for Phase 3...\n");

  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    let userToken = "";
    let adminToken = "";

    // 1. Successful Registration
    console.log("--- 1. Registration Tests ---");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: testEmail,
        password: "Password@123",
      }),
    });
    const regData = await regRes.json();
    userToken = regData.data?.token;

    await assert(
      "POST /api/auth/register creates user and returns session token",
      regRes.status === 201 &&
        regData.success === true &&
        regData.data?.user?.email === testEmail &&
        regData.data?.user?.role === "CUSTOMER" &&
        !regData.data?.user?.passwordHash && // Ensure passwordHash is never returned
        typeof userToken === "string",
      JSON.stringify(regData)
    );

    // 2. Duplicate Registration Rejection
    const dupRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer Duplicate",
        email: testEmail,
        password: "Password@123",
      }),
    });
    const dupRegData = await dupRegRes.json();
    await assert(
      "POST /api/auth/register rejects duplicate email with HTTP 400",
      dupRegRes.status === 400 && dupRegData.success === false,
      dupRegData.message
    );

    // 3. Invalid Registration (Weak Password)
    const weakPassRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Weak Pass",
        email: "weakpass@example.com",
        password: "123", // Too short
      }),
    });
    const weakPassData = await weakPassRes.json();
    await assert(
      "POST /api/auth/register rejects password under 6 chars with HTTP 400",
      weakPassRes.status === 400 && weakPassData.success === false,
      JSON.stringify(weakPassData)
    );

    // 4. Successful Login
    console.log("\n--- 2. Login & Session Tests ---");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "Password@123",
      }),
    });
    const loginData = await loginRes.json();
    await assert(
      "POST /api/auth/login logs in successfully with valid credentials",
      loginRes.status === 200 &&
        loginData.success === true &&
        loginData.data?.user?.email === testEmail &&
        !loginData.data?.user?.passwordHash,
      JSON.stringify(loginData)
    );

    // 5. Invalid Login (Wrong Password)
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword999",
      }),
    });
    const wrongPassData = await wrongPassRes.json();
    await assert(
      "POST /api/auth/login rejects incorrect password with HTTP 401",
      wrongPassRes.status === 401 && wrongPassData.success === false,
      wrongPassData.message
    );

    // 6. Admin Login (from seed data)
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@kalyankids.com",
        password: "Admin@12345",
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.data?.token;
    await assert(
      "POST /api/auth/login authenticates seeded Admin user",
      adminLoginRes.status === 200 && adminLoginData.data?.user?.role === "ADMIN",
      JSON.stringify(adminLoginData)
    );

    // 7. Protected Route - GET /api/auth/me (with Token)
    console.log("\n--- 3. Protected Route & Profile Tests ---");
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meData = await meRes.json();
    await assert(
      "GET /api/auth/me returns authenticated user profile via Bearer token",
      meRes.status === 200 && meData.success === true && meData.data?.email === testEmail,
      JSON.stringify(meData)
    );

    // 8. Protected Route without Token (Unauthorized)
    const unauthRes = await fetch(`${BASE_URL}/auth/me`);
    const unauthData = await unauthRes.json();
    await assert(
      "GET /api/auth/me rejects unauthenticated request with HTTP 401",
      unauthRes.status === 401 && unauthData.success === false,
      unauthData.message
    );

    // 9. Profile Update
    const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: "Updated Customer Name",
      }),
    });
    const updateData = await updateRes.json();
    await assert(
      "PUT /api/auth/profile updates user display name",
      updateRes.status === 200 && updateData.data?.name === "Updated Customer Name",
      JSON.stringify(updateData)
    );

    // 10. Logout
    console.log("\n--- 4. Logout & Password Reset Tests ---");
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });
    const logoutData = await logoutRes.json();
    await assert(
      "POST /api/auth/logout clears session",
      logoutRes.status === 200 && logoutData.success === true,
      logoutData.message
    );

    // 11. Forgot Password Flow
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = await forgotRes.json();
    const resetToken = forgotData.resetToken;
    await assert(
      "POST /api/auth/forgot-password issues reset token and generic success notice",
      forgotRes.status === 200 && forgotData.success === true && typeof resetToken === "string",
      JSON.stringify(forgotData)
    );

    // 12. Reset Password with Token
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        newPassword: "BrandNewPassword@2026",
      }),
    });
    const resetData = await resetRes.json();
    await assert(
      "POST /api/auth/reset-password resets user password with valid token",
      resetRes.status === 200 && resetData.success === true,
      resetData.message
    );

    // 13. Login with New Password
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "BrandNewPassword@2026",
      }),
    });
    const newLoginData = await newLoginRes.json();
    await assert(
      "POST /api/auth/login succeeds with updated password",
      newLoginRes.status === 200 && newLoginData.success === true,
      JSON.stringify(newLoginData)
    );

    // 14. Old Password Rejection
    const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "Password@123", // Old password
      }),
    });
    await assert(
      "POST /api/auth/login rejects previous old password",
      oldLoginRes.status === 401,
      `Status: ${oldLoginRes.status}`
    );

    // 15. Rejection of already used reset token
    const reuseTokenRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        newPassword: "AnotherPassword@999",
      }),
    });
    const reuseTokenData = await reuseTokenRes.json();
    await assert(
      "POST /api/auth/reset-password rejects already used reset token with HTTP 400",
      reuseTokenRes.status === 400 && reuseTokenData.success === false,
      reuseTokenData.message
    );

    console.log("\n=================================");
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`Auth Test Summary: ${passedCount} / ${results.length} PASSED`);
    console.log("=================================");

    if (passedCount === results.length) {
      console.log("🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!");
      process.exit(0);
    } else {
      console.error("❌ Some auth tests failed.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Auth test runner encountered an error:", err);
    process.exit(1);
  }
}

runAuthTests();
