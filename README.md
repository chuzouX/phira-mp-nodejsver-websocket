# WebSocket Support Plugin

WebSocket 实时通信支持，为 Web 管理面板提供实时房间和玩家状态更新。

## 功能特性

- ✅ **实时房间列表** - 房间创建/变更时自动推送更新
- ✅ **房间详情查询** - 支持客户端请求指定房间详情
- ✅ **服务器统计** - 实时推送在线人数统计
- ✅ **Origin 验证** - 跨域请求安全检查
- ✅ **IP 获取** - 支持 X-Forwarded-For 和 X-Real-IP
- ✅ **管理员识别** - 通过 Session 识别管理员身份
- ✅ **联邦支持** - 支持跨服务器联邦房间数据同步
- ✅ **房间过滤** - 支持公开/私密房间过滤策略
- ✅ **插件广播** - 提供通用广播接口供其他插件使用

## 配置方法

在 `config/websocket/config.yaml` 中配置：

```yaml
# 允许的跨域来源
allowedOrigins:
  - http://localhost:5173
  - http://localhost:3000
```

## 消息协议

### 服务端推送

```json
// 房间列表更新
{ "type": "roomList", "payload": [ { "id": "...", "name": "...", ... } ] }

// 服务器统计
{ "type": "serverStats", "payload": { "totalPlayers": 42 } }
```

### 客户端请求

```json
// 请求房间详情
{ "type": "getRoomDetails", "payload": { "roomId": "room-1" } }
```

### 服务端响应

```json
{ "type": "roomDetails", "payload": { "id": "...", "name": "...", "players": [...], ... } }
```

## 插件广播接口

其他插件可通过 `api.broadcast(type, payload)` 发送广播消息：

```typescript
api.broadcast('myEvent', { data: 'hello' });
```

## 安全特性

- **Origin 验证** - 检查 WebSocket 连接的 Origin 头，防止跨站劫持
- **Session 集成** - 复用 HTTP Session 识别管理员身份
- **IP 信任代理** - 支持通过反向代理获取真实 IP

## 依赖说明

本插件无依赖，是基础服务插件，为 web-dashboard 和其他插件提供 WebSocket 通信能力。

插件加载顺序：

1. **websocket** (无依赖，最先加载)
2. web-dashboard (依赖 websocket)

## 开发者信息

- **插件 ID**: websocket
- **UUID**: c8d4e5f6-9a2b-4c7d-8e1f-3a9b6c5d7e2a
- **版本**: 1.2.1
- **依赖**: 无
