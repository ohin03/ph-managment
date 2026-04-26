import { getToken } from "../utils/token.util";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

export const logoutWithAttendance = async () => {
  try {
    await fetch(`${baseUrl}/attendance/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      }
    });
  } catch (e) {
    // swallow errors – logout should still proceed
  }
};

