import ClientApp from './client-app';

export default function Home() {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_CLAWDBOT_GATEWAY_URL || 'ws://100.102.236.81:18789';

  // Prefer server-only env var. (Still sent to client today — later we can proxy to avoid this.)
  const token =
    process.env.CLAWDBOT_GATEWAY_TOKEN ||
    process.env.NEXT_PUBLIC_CLAWDBOT_GATEWAY_TOKEN ||
    '';

  return <ClientApp gatewayUrl={gatewayUrl} token={token} />;
}
