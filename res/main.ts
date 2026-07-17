import type { PluginApi, PluginModule } from 'phira-plugin-api';
import { PluginWebSocketServer } from './lib/WebSocketServer';

let instance: PluginWebSocketServer | undefined;
const unsubscribers: Array<() => void> = [];

const pluginModule: PluginModule = {
  name: 'websocket',

  init(api: PluginApi) {
    const httpServer = api.httpServer;
    if (!httpServer) {
      api.logger.warn('[websocket] HTTP 服务未启用，跳过 WebSocket 插件加载');
      return;
    }

    const pluginConfig = api.readPluginConfig<{ allowedOrigins?: string[] }>() ?? {};

    instance = new PluginWebSocketServer(
      httpServer.getInternalServer(),
      api.roomManager,
      api.protocolHandler,
      {
        ...api.config,
        allowedOrigins: pluginConfig.allowedOrigins ?? api.config.allowedOrigins,
      },
      api.logger,
      httpServer.getSessionParser(),
      api.federationManager,
    );

    unsubscribers.push(api.events.on('room:create', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('room:join', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('room:leave', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('room:gameStart', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('room:gameEnd', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('player:connect', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('player:disconnect', () => instance!.broadcastRooms()));
    unsubscribers.push(api.events.on('chat:message', () => instance!.broadcastRooms()));

    api.logger.info('[websocket] WebSocket 前置插件已加载');
  },

  async destroy() {
    unsubscribers.forEach(unsub => unsub());
    unsubscribers.length = 0;
    instance?.close();
    instance = undefined;
  }
};

export default pluginModule;
