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

    unsubscribers.push(
      api.events.on('room:create', () => {
        api.logger.debug('[websocket] event: room:create');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('room:join', () => {
        api.logger.debug('[websocket] event: room:join');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('room:leave', () => {
        api.logger.debug('[websocket] event: room:leave');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('room:gameStart', () => {
        api.logger.debug('[websocket] event: room:gameStart');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('room:gameEnd', () => {
        api.logger.debug('[websocket] event: room:gameEnd');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('player:connect', () => {
        api.logger.debug('[websocket] event: player:connect');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('player:disconnect', () => {
        api.logger.debug('[websocket] event: player:disconnect');
        instance!.broadcastRooms();
      }),
    );
    unsubscribers.push(
      api.events.on('chat:message', () => {
        api.logger.debug('[websocket] event: chat:message');
        instance!.broadcastRooms();
      }),
    );

    api.logger.info('[websocket] WebSocket 前置插件已加载');
  },

  async destroy() {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers.length = 0;
    instance?.close();
    instance = undefined;
  },
};

export default pluginModule;
