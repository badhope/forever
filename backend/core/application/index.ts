
/**
 * Forever AI - Application Layer
 * 第五层：应用生态层
 */

// REST API
export {
  RestApiGateway,
  restApiGateway,
  ApiRequest,
  ApiResponse,
  RouteHandler,
} from './rest-api';

// WebSocket
export {
  WebSocketServer,
  webSocketServer,
  WebSocketClient,
} from './websocket';

// Streaming
export {
  StreamManager,
  streamManager,
  StreamEvent,
  StreamClient,
} from './streaming';

// Admin Dashboard
export {
  AdminDashboard,
  adminDashboard,
  DashboardWidget,
  AdminUser,
  DashboardLog,
} from './admin-dashboard';

// Deployment
export {
  DeploymentManager,
  deploymentManager,
  DeploymentConfig,
  DockerConfig,
  KubernetesConfig,
} from './deployment';

