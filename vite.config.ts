/*
 * @Author: 李志刚
 * @Date: 2025-02-28 00:32:50
 * @LastEditors: 李志刚
 * @LastEditTime: 2025-02-28 17:15:46
 * @Description:
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
    host: true,
  },
  preview: {
    host: true,
    allowedHosts: ["openapi-dev.swapflow.io"],
  },
});
