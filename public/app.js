const roleLevel = {
  viewer: 1,
  analyst: 2,
  admin: 3
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const state = {
  token: localStorage.getItem("finance_token") || "",
  user: null,
  overview: null,
  trends: [],
  records: [],
  users: []
};

const el = {
  toast: document.getElementById("toast"),
  authSection: document.getElementById("authSection"),
  appSection: document.getElementById("appSection"),

  loginForm: document.getElementById("loginForm"),
  bootstrapForm: document.getElementById("bootstrapForm"),
  registerForm: document.getElementById("registerForm"),
  logoutBtn: document.getElementById("logoutBtn"),

  sessionName: document.getElementById("sessionName"),
  sessionRole: document.getElementById("sessionRole"),
  welcomeLine: document.getElementById("welcomeLine"),

  globalStartDate: document.getElementById("globalStartDate"),
  globalEndDate: document.getElementById("globalEndDate"),
  globalPeriod: document.getElementById("globalPeriod"),
  refreshOverviewBtn: document.getElementById("refreshOverviewBtn"),

  kpiIncome: document.getElementById("kpiIncome"),
  kpiExpense: document.getElementById("kpiExpense"),
  kpiBalance: document.getElementById("kpiBalance"),
  kpiEntries: document.getElementById("kpiEntries"),
  trendMeta: document.getElementById("trendMeta"),
  trendChart: document.getElementById("trendChart"),
  categoryList: document.getElementById("categoryList"),
  recentList: document.getElementById("recentList"),

  recordFilterForm: document.getElementById("recordFilterForm"),
  recordCreateForm: document.getElementById("recordCreateForm"),
  recordsBody: document.getElementById("recordsBody"),
  recordMeta: document.getElementById("recordMeta"),

  userCreateForm: document.getElementById("userCreateForm"),
  loadUsersBtn: document.getElementById("loadUsersBtn"),
  usersBody: document.getElementById("usersBody")
};

const safe = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formDataToObject = (formEl) => Object.fromEntries(new FormData(formEl).entries());

const buildQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) {
      return;
    }
    query.append(key, value);
  });
  return query.toString();
};

const getGlobalFilters = () => ({
  startDate: el.globalStartDate.value,
  endDate: el.globalEndDate.value,
  period: el.globalPeriod.value || "monthly"
});

const showToast = (message, type = "success") => {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden", "error");
  if (type === "error") {
    el.toast.classList.add("error");
  }
  window.setTimeout(() => el.toast.classList.add("hidden"), 3200);
};

const api = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    const details = payload.errors ? ` | ${JSON.stringify(payload.errors)}` : "";
    throw new Error((payload.message || "Request failed") + details);
  }

  return payload;
};

const setAuth = (token, user) => {
  state.token = token;
  state.user = user;
  localStorage.setItem("finance_token", token);
  renderShell();
};

const clearAuth = () => {
  state.token = "";
  state.user = null;
  state.overview = null;
  state.trends = [];
  state.records = [];
  state.users = [];
  localStorage.removeItem("finance_token");
  renderShell();
};

const canAccess = (roleName) => {
  if (!state.user) {
    return false;
  }
  return roleLevel[state.user.role] >= roleLevel[roleName];
};

const setActiveView = (viewName) => {
  document.querySelectorAll(".menu-item").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-view") === viewName);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `view${viewName[0].toUpperCase()}${viewName.slice(1)}`);
  });
};

const renderShell = () => {
  const loggedIn = Boolean(state.token && state.user);

  el.authSection.classList.toggle("hidden", loggedIn);
  el.appSection.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) {
    return;
  }

  el.sessionName.textContent = state.user.fullName;
  el.sessionRole.textContent = state.user.role;
  el.welcomeLine.textContent = `Hello, ${state.user.fullName.split(" ")[0]}`;

  document.querySelectorAll("[data-min-role]").forEach((node) => {
    const minRole = node.getAttribute("data-min-role");
    node.classList.toggle("hidden", !canAccess(minRole));
  });

  const menuViews = Array.from(document.querySelectorAll(".menu-item"))
    .filter((button) => !button.classList.contains("hidden"))
    .map((button) => button.getAttribute("data-view"));
  setActiveView(menuViews[0] || "overview");
};

const toSeriesMap = (trends) => {
  const map = new Map();

  trends.forEach((item) => {
    const id = item._id || {};
    const key = id.week ? `${id.year}-W${id.week}` : `${id.year}-${String(id.month).padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, { income: 0, expense: 0 });
    }
    const bucket = map.get(key);
    if (id.type === "income") {
      bucket.income = item.total;
    } else {
      bucket.expense = item.total;
    }
  });

  return Array.from(map.entries()).map(([label, values]) => ({ label, ...values }));
};

const renderTrendChart = (trends) => {
  const series = toSeriesMap(trends);
  const width = 760;
  const height = 260;
  const padX = 46;
  const padY = 26;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (!series.length) {
    el.trendChart.innerHTML = `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#64748b" font-size="14">No trend data found</text>`;
    return;
  }

  const maxValue = Math.max(
    ...series.flatMap((point) => [point.income || 0, point.expense || 0]),
    1
  );

  const stepX = series.length > 1 ? innerW / (series.length - 1) : 0;
  const xAt = (index) => padX + index * stepX;
  const yAt = (value) => padY + innerH - (value / maxValue) * innerH;

  const linePath = (field) =>
    series
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index)} ${yAt(point[field] || 0)}`)
      .join(" ");

  const incomePath = linePath("income");
  const expensePath = linePath("expense");

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const y = padY + innerH * ratio;
      return `<line x1="${padX}" y1="${y}" x2="${padX + innerW}" y2="${y}" stroke="#d8e3f3" stroke-dasharray="3 3" />`;
    })
    .join("");

  const xLabels = series
    .map((point, index) => {
      if (series.length > 6 && index % 2 !== 0) {
        return "";
      }
      return `<text x="${xAt(index)}" y="${height - 8}" text-anchor="middle" fill="#64748b" font-size="10">${safe(point.label)}</text>`;
    })
    .join("");

  el.trendChart.innerHTML = `
    ${gridLines}
    <path d="${incomePath}" fill="none" stroke="#0e7490" stroke-width="3" stroke-linecap="round" />
    <path d="${expensePath}" fill="none" stroke="#c2410c" stroke-width="3" stroke-linecap="round" />
    ${series
      .map(
        (point, index) =>
          `<circle cx="${xAt(index)}" cy="${yAt(point.income || 0)}" r="4" fill="#0e7490" />
           <circle cx="${xAt(index)}" cy="${yAt(point.expense || 0)}" r="4" fill="#c2410c" />`
      )
      .join("")}
    ${xLabels}
    <text x="${padX}" y="16" fill="#0e7490" font-size="12" font-weight="700">Income</text>
    <text x="${padX + 72}" y="16" fill="#c2410c" font-size="12" font-weight="700">Expense</text>
  `;
};

const renderCategoryList = (categoryTotals) => {
  if (!categoryTotals?.length) {
    el.categoryList.innerHTML = `<div class="list-item"><small>No categories available</small></div>`;
    return;
  }

  el.categoryList.innerHTML = categoryTotals
    .slice(0, 8)
    .map(
      (item) => `
      <div class="list-item">
        <div>
          <strong>${safe(item._id?.category || "N/A")}</strong>
          <small>${safe(item._id?.type || "")}</small>
        </div>
        <strong>${money.format(item.total || 0)}</strong>
      </div>
    `
    )
    .join("");
};

const renderRecentList = (recentActivity) => {
  if (!recentActivity?.length) {
    el.recentList.innerHTML = `<div class="recent-item"><small>No recent activity</small></div>`;
    return;
  }

  el.recentList.innerHTML = recentActivity
    .map(
      (item) => `
      <div class="recent-item">
        <div>
          <strong>${safe(item.category)}</strong>
          <small>${safe(item.type)} | ${new Date(item.date).toLocaleDateString()}</small>
        </div>
        <strong>${money.format(item.amount || 0)}</strong>
      </div>
    `
    )
    .join("");
};

const renderOverview = () => {
  const data = state.overview || {};
  const income = data.totalIncome || 0;
  const expense = data.totalExpenses || 0;
  const balance = data.netBalance || 0;
  const recentEntries = data.recentActivity?.length || 0;

  el.kpiIncome.textContent = money.format(income);
  el.kpiExpense.textContent = money.format(expense);
  el.kpiBalance.textContent = money.format(balance);
  el.kpiEntries.textContent = String(recentEntries);

  renderCategoryList(data.categoryTotals || []);
  renderRecentList(data.recentActivity || []);
  renderTrendChart(state.trends || data.monthlyTrends || []);

  const period = getGlobalFilters().period;
  el.trendMeta.textContent = `Period: ${period}`;
};

const fetchOverview = async () => {
  const filters = getGlobalFilters();
  const query = buildQuery({ startDate: filters.startDate, endDate: filters.endDate });
  const response = await api(`/api/dashboard/overview${query ? `?${query}` : ""}`);
  state.overview = response.data;
};

const fetchTrends = async () => {
  const filters = getGlobalFilters();
  const query = buildQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    period: filters.period
  });
  const response = await api(`/api/dashboard/trends?${query}`);
  state.trends = response.data || [];
};

const refreshOverview = async () => {
  try {
    await Promise.all([fetchOverview(), fetchTrends()]);
    renderOverview();
    showToast("Overview refreshed");
  } catch (error) {
    showToast(error.message, "error");
  }
};

const renderRecords = (pagination = {}) => {
  if (!state.records.length) {
    el.recordsBody.innerHTML = "<tr><td colspan='7'>No records found</td></tr>";
    el.recordMeta.textContent = "No data";
    return;
  }

  el.recordsBody.innerHTML = state.records
    .map((record) => {
      const actionButton =
        state.user.role === "admin"
          ? record.isDeleted
            ? `<button class="mini-btn restore" data-action="restore" data-id="${record._id}">Restore</button>`
            : `<button class="mini-btn delete" data-action="delete" data-id="${record._id}">Delete</button>`
          : "-";

      return `
      <tr>
        <td>${money.format(record.amount || 0)}</td>
        <td>${safe(record.type)}</td>
        <td>${safe(record.category)}</td>
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td>${safe(record.createdBy?.fullName || "-")}</td>
        <td><span class="badge ${record.isDeleted ? "warn" : "success"}">${record.isDeleted ? "deleted" : "active"}</span></td>
        <td>${actionButton}</td>
      </tr>`;
    })
    .join("");

  el.recordMeta.textContent = `Total ${pagination.total || state.records.length} | Page ${
    pagination.page || 1
  }`;
};

const loadRecords = async (evt) => {
  if (evt) {
    evt.preventDefault();
  }
  try {
    const filters = formDataToObject(el.recordFilterForm);
    const query = buildQuery({
      page: 1,
      limit: 20,
      type: filters.type,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
      includeDeleted: filters.includeDeleted === "on"
    });
    const response = await api(`/api/records?${query}`);
    state.records = response.data || [];
    renderRecords(response.pagination || {});
  } catch (error) {
    showToast(error.message, "error");
  }
};

const createRecord = async (evt) => {
  evt.preventDefault();
  try {
    const payload = formDataToObject(el.recordCreateForm);
    payload.amount = Number(payload.amount);
    const response = await api("/api/records", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    showToast(response.message || "Record created");
    el.recordCreateForm.reset();
    await Promise.all([loadRecords(), refreshOverview()]);
  } catch (error) {
    showToast(error.message, "error");
  }
};

const onRecordTableClick = async (evt) => {
  const button = evt.target.closest("button[data-action]");
  if (!button) {
    return;
  }
  const id = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");
  if (!id || !action) {
    return;
  }

  try {
    if (action === "delete") {
      await api(`/api/records/${id}`, { method: "DELETE" });
      showToast("Record soft deleted");
    } else if (action === "restore") {
      await api(`/api/records/${id}/restore`, { method: "PATCH", body: JSON.stringify({}) });
      showToast("Record restored");
    }
    await Promise.all([loadRecords(), refreshOverview()]);
  } catch (error) {
    showToast(error.message, "error");
  }
};

const renderUsers = () => {
  if (!state.users.length) {
    el.usersBody.innerHTML = "<tr><td colspan='5'>No users found</td></tr>";
    return;
  }

  el.usersBody.innerHTML = state.users
    .map((user) => {
      const action =
        user.isActive && user._id !== state.user._id
          ? `<button class="mini-btn delete" data-user-action="deactivate" data-user-id="${user._id}">Deactivate</button>`
          : "-";
      return `
      <tr>
        <td>${safe(user.fullName)}</td>
        <td>${safe(user.email)}</td>
        <td>${safe(user.role)}</td>
        <td><span class="badge ${user.isActive ? "success" : "warn"}">${
          user.isActive ? "active" : "inactive"
        }</span></td>
        <td>${action}</td>
      </tr>`;
    })
    .join("");
};

const loadUsers = async () => {
  try {
    const response = await api("/api/users?page=1&limit=50");
    state.users = response.data || [];
    renderUsers();
  } catch (error) {
    showToast(error.message, "error");
  }
};

const createUser = async (evt) => {
  evt.preventDefault();
  try {
    const payload = formDataToObject(el.userCreateForm);
    payload.isActive = true;
    const response = await api("/api/users", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    showToast(response.message || "User created");
    el.userCreateForm.reset();
    await loadUsers();
  } catch (error) {
    showToast(error.message, "error");
  }
};

const onUserTableClick = async (evt) => {
  const button = evt.target.closest("button[data-user-action]");
  if (!button) {
    return;
  }
  const userId = button.getAttribute("data-user-id");
  if (!userId) {
    return;
  }
  try {
    await api(`/api/users/${userId}`, { method: "DELETE" });
    showToast("User deactivated");
    await loadUsers();
  } catch (error) {
    showToast(error.message, "error");
  }
};

const login = async (evt) => {
  evt.preventDefault();
  try {
    const payload = formDataToObject(el.loginForm);
    const response = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setAuth(response.data.token, response.data.user);
    showToast("Login successful");
    await bootstrapDashboardData();
  } catch (error) {
    showToast(error.message, "error");
  }
};

const bootstrapAdmin = async (evt) => {
  evt.preventDefault();
  try {
    const payload = formDataToObject(el.bootstrapForm);
    const response = await api("/api/auth/bootstrap-admin", {
      method: "POST",
      body: JSON.stringify({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password
      })
    });
    setAuth(response.data.token, response.data.user);
    showToast("Bootstrap admin created");
    await bootstrapDashboardData();
  } catch (error) {
    showToast(error.message, "error");
  }
};

const registerViewer = async (evt) => {
  evt.preventDefault();
  try {
    const payload = formDataToObject(el.registerForm);
    const response = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setAuth(response.data.token, response.data.user);
    showToast("Viewer account created");
    await bootstrapDashboardData();
  } catch (error) {
    showToast(error.message, "error");
  }
};

const loadProfile = async () => {
  if (!state.token) {
    return;
  }
  try {
    const response = await api("/api/auth/me");
    state.user = response.data;
  } catch (error) {
    clearAuth();
  }
};

const bootstrapDashboardData = async () => {
  await refreshOverview();
  if (canAccess("analyst")) {
    await loadRecords();
  }
  if (canAccess("admin")) {
    await loadUsers();
  }
};

const bindAuthTabs = () => {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-auth-tab");
      document.querySelectorAll(".tab-btn").forEach((node) => {
        node.classList.toggle("active", node === button);
      });
      document.querySelectorAll(".auth-tab").forEach((content) => {
        content.classList.remove("active");
      });
      const panel = document.getElementById(`${tab}Tab`);
      if (panel) {
        panel.classList.add("active");
      }
    });
  });
};

const bindViewMenu = () => {
  document.querySelectorAll(".menu-item").forEach((button) => {
    button.addEventListener("click", async () => {
      const view = button.getAttribute("data-view");
      setActiveView(view);
      if (view === "overview") {
        await refreshOverview();
      }
      if (view === "records" && canAccess("analyst")) {
        await loadRecords();
      }
      if (view === "users" && canAccess("admin")) {
        await loadUsers();
      }
    });
  });
};

const bindEvents = () => {
  bindAuthTabs();
  bindViewMenu();

  el.loginForm.addEventListener("submit", login);
  el.bootstrapForm.addEventListener("submit", bootstrapAdmin);
  el.registerForm.addEventListener("submit", registerViewer);
  el.logoutBtn.addEventListener("click", clearAuth);

  el.refreshOverviewBtn.addEventListener("click", refreshOverview);
  el.globalPeriod.addEventListener("change", refreshOverview);

  el.recordFilterForm.addEventListener("submit", loadRecords);
  el.recordCreateForm.addEventListener("submit", createRecord);
  el.recordsBody.addEventListener("click", onRecordTableClick);

  el.userCreateForm.addEventListener("submit", createUser);
  el.loadUsersBtn.addEventListener("click", loadUsers);
  el.usersBody.addEventListener("click", onUserTableClick);
};

const init = async () => {
  bindEvents();
  await loadProfile();
  renderShell();
  if (state.user) {
    await bootstrapDashboardData();
  }
};

init();
