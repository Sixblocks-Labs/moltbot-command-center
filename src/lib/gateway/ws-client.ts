'use client';

import type { ChatEvent } from './types';
import {
  buildDeviceAuthPayload,
  loadOrCreateDeviceIdentity,
  signDevicePayload,
} from './device-identity';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type GatewayHelloOk = {
  type: 'hello-ok';
  protocol: number;
  auth?: { deviceToken?: string; role?: string; scopes?: string[] };
  policy?: { tickIntervalMs?: number };
};

export type GatewayEventFrame = {
  type: 'event';
  event: string;
  payload?: any;
  seq?: number;
};

export type GatewayResponseFrame = {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: any;
  error?: { message?: string };
};

export class BrowserGatewayClient {
  private ws: WebSocket | null = null;
  private connectNonce: string | null = null;
  private connectSent = false;

  constructor(
    private opts: {
      url: string;
      token?: string;
      onHelloOk: (hello: GatewayHelloOk) => void;
      onClose: (code: number, reason: string) => void;
      onChatEvent: (evt: ChatEvent) => void;
      onError: (err: string) => void;
    }
  ) {}

  start() {
    this.connectNonce = null;
    this.connectSent = false;

    this.ws = new WebSocket(this.opts.url);
    this.ws.onopen = () => {
      // Wait for connect.challenge; gateway may also accept connect without it on local.
      // We'll still send after a short delay as a fallback.
      window.setTimeout(() => {
        void this.sendConnect();
      }, 750);
    };

    this.ws.onclose = (e) => {
      this.opts.onClose(e.code, String(e.reason ?? ''));
    };

    this.ws.onerror = () => {
      this.opts.onError('WebSocket error');
    };

    this.ws.onmessage = (evt) => {
      let data: any;
      try {
        data = JSON.parse(String(evt.data ?? ''));
      } catch {
        return;
      }

      const f = data as GatewayEventFrame | GatewayResponseFrame;

      if (f.type === 'event' && (f as GatewayEventFrame).event === 'connect.challenge') {
        const nonce = (f as GatewayEventFrame).payload?.nonce;
        if (typeof nonce === 'string') {
          this.connectNonce = nonce;
          void this.sendConnect();
        }
        return;
      }

      if (f.type === 'res') {
        const r = f as GatewayResponseFrame;
        if (r.ok && r.payload?.type === 'hello-ok') {
          this.opts.onHelloOk(r.payload as GatewayHelloOk);
          return;
        }
      }

      // Chat events
      if (f.type === 'event' && (f as GatewayEventFrame).event === 'chat') {
        this.opts.onChatEvent((f as GatewayEventFrame).payload as ChatEvent);
        return;
      }

      // ignore others
    };
  }

  stop() {
    this.ws?.close();
    this.ws = null;
  }

  private async sendConnect() {
    if (this.connectSent) return;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.connectSent = true;

    const role = 'operator';
    const scopes = ['operator.read', 'operator.write', 'operator.admin'];

    const params: any = {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: 'webchat',
        displayName: 'Moltbot Command Center',
        version: '0.1.0',
        platform: navigator.platform ?? 'web',
        mode: 'webchat',
      },
      role,
      scopes,
      caps: [],
      userAgent: navigator.userAgent,
      locale: navigator.language,
    };

    // Token auth: skip device identity to avoid pairing requirement
    if (this.opts.token) {
      params.auth = { token: this.opts.token };
    } else {
      // Fallback: device identity + pairing flow
      const identity = loadOrCreateDeviceIdentity();
      const signedAt = Date.now();

      const payload = buildDeviceAuthPayload({
        deviceId: identity.deviceId,
        clientId: 'webchat',
        clientMode: 'webchat',
        role,
        scopes,
        signedAtMs: signedAt,
        token: null,
        nonce: this.connectNonce ?? undefined,
      });

      const signature = await signDevicePayload(identity.privateKeyRawBase64Url, payload);

      params.device = {
        id: identity.deviceId,
        publicKey: identity.publicKeyRawBase64Url,
        signature,
        signedAt,
        nonce: this.connectNonce ?? undefined,
      };
    }

    const connectFrame = {
      type: 'req',
      id: uid(),
      method: 'connect',
      params,
    };

    this.ws.send(JSON.stringify(connectFrame));
  }

  request(method: string, params: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('gateway not connected');
    }

    const frame = {
      type: 'req',
      id: uid(),
      method,
      params,
    };

    this.ws.send(JSON.stringify(frame));
  }
}
