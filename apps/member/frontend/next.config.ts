import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 認証関連ページの静的最適化を無効化
  unstable_runtimeJS: true,

  // コールバックルートを適切に処理するためのリライト設定
  async rewrites() {
    return [
      // {
      //   source: "/",
      //   destination: "/",
      // },
      {
        source: "/auth/callback",
        destination: "/auth/callback",
      },
    ];
  },

  // 必要に応じてヘッダー設定を追加（CORS対応）
  // async headers() {
  //   return [
  //     {
  //       source: "/auth/callback",
  //       headers: [
  //         { key: "Access-Control-Allow-Credentials", value: "true" },
  //         { key: "Access-Control-Allow-Origin", value: "*" }, // 本番環境では適切なオリジンに制限することを推奨
  //         { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value:
  //             "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  //         },
  //       ],
  //     },
  //   ];
  // },

  // ビルド最適化の調整
  webpack: (config, { dev, isServer }) => {
    // 本番環境でのみ適用する最適化調整
    if (!dev) {
      // クライアントサイドのコードを適切に保持
      if (!isServer) {
        // チャンク分割の最適化を調整して認証関連のコードが適切に処理されるようにする
        config.optimization.splitChunks = {
          cacheGroups: {
            default: false,
            vendors: false,
          },
        };
      }
    }
    return config;
  },
  poweredByHeader: false,
};

export default nextConfig;
