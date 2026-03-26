import { ref } from "vue";
import { hasToken, clearTokens } from "../api";

const isAuthenticated = ref(hasToken());

const setAuthenticated = (value: boolean) => {
    isAuthenticated.value = Boolean(value)
}

const loginSuccess = () => {
    setAuthenticated(true);
}

const logout = () => {
    clearTokens();
    setAuthenticated(false);
}

const syncFromToken = () => {
    setAuthenticated(hasToken());
}

export const useAuthStore = () => ({
    isAuthenticated,
    setAuthenticated,
    loginSuccess,
    logout,
    syncFromToken,
})