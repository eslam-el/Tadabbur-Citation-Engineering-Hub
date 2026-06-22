import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  serverExternalPackages: ["xlsx"],
  // تثبيت جذر تتبّع الملفات على مجلد المشروع (يمنع التقاط ملفات lock خارجية)
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
