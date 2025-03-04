import { message } from "antd";
const accessTokenApi =
  "https://ap-southeast-1yavpb2by9.auth.ap-southeast-1.amazoncognito.com/oauth2/token";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
export async function getAccessToken() {
  const last_access_token = localStorage.getItem("AccessToken");
  const expiresAt = Number(localStorage.getItem("ExpiresAt"));
  
  // 如果没有token或者token已过期，重新获取
  if (!last_access_token || Date.now() >= expiresAt) {
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "default-m2m-resource-server-uiy5fg/read",
    });

    const response = await fetch(accessTokenApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await response.json();
    if (!data || !data.access_token) {
      message.error("get access token failed");
      return null;
    }
    const access_token = `Bearer ${data.access_token}`;
    // 计算过期时间戳（当前时间 + expires_in秒）
    const expiresAt = Date.now() + data.expires_in * 1000;
    localStorage.setItem("AccessToken", access_token);
    localStorage.setItem("ExpiresAt", String(expiresAt));
    return access_token;
  }
  
  return last_access_token;
}
