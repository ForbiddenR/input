const getStorageWithKey = (key: string) => {
    if (localStorage.getItem(key) !== null) return localStorage;
    if (sessionStorage.getItem(key) !== null) return sessionStorage;
    return null;
};

export const getAccessToken = () =>
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

export const getRefreshToken = () =>
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken");

export const hasToken = () => Boolean(getAccessToken());

type AuthResponse = {
    user: User,
    accessToken?: string,
    refreshToken?: string,
}

type User = {
    id: string,
    email: string,
    name: string,
}

const setTokens = (data: AuthResponse | null) => {
    const storage =
        getStorageWithKey("refreshToken") ??
        getStorageWithKey("accessToken") ??
        localStorage;

    if (data?.accessToken) storage.setItem("accessToken", data.accessToken);
    if (data?.refreshToken) storage.setItem("refreshToken", data.refreshToken);
    if (data?.user) storage.setItem("user", JSON.stringify(data.user));
};

export const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
    if (refreshPromise) return refreshPromise;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    refreshPromise = (async () => {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.accessToken) {
            clearTokens();
            return null;
        }

        setTokens(data);
        return data.accessToken;
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
};

type Token = string | null | undefined;

const buildHeaders = (options: RequestInit = {}, token: Token) => {
    const headers = new Headers(options.headers ?? {});

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
};

export const authFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
    const token = getAccessToken();
    const response = await fetch(url, {
        ...options,
        headers: buildHeaders(options, token),
    });

    if (response.status !== 401) return response;

    const newToken = await refreshAccessToken();
    if (!newToken) return response;

    return fetch(url, {
        ...options,
        headers: buildHeaders(options, newToken),
    });
};