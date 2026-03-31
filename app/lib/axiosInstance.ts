import axios from "axios";

const axiosInstance = axios.create();

let isSessionExpired = false;

export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

const showSessionExpiredToast = () => {
  const existing = document.getElementById("session-expired-toast");
  if (existing) return;

  const toast = document.createElement("div");
  toast.id = "session-expired-toast";
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 99999;
    background: #ff4444; color: white; padding: 16px 24px;
    border-radius: 8px; font-size: 14px; font-family: sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
  `;
  toast.textContent = "Session expired. Please login again.";

  const style = document.createElement("style");
  style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    localStorage.clear();
    isSessionExpired = false;
    window.location.href = "/";
  }, 3000);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAuthError(error)) {
      if (typeof window !== "undefined" && !isSessionExpired) {
        isSessionExpired = true;
        showSessionExpiredToast();
      }
    }
    return Promise.reject(error);
  }
);

export { isSessionExpired };
export const resetSessionExpiredFlag = () => { isSessionExpired = false; };
export default axiosInstance;
