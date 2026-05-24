
/**
 * Forever AI - Deployment Configuration
 * 第五层：应用生态层 - Docker/K8s 部署配置
 */

export interface DockerConfig {
  image: string;
  tag: string;
  ports: number[];
  volumes: string[];
  environment: Record<string, string>;
  networks: string[];
}

export interface KubernetesConfig {
  namespace: string;
  replicas: number;
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits: {
      cpu: string;
      memory: string;
    };
  };
  healthCheck: {
    livenessProbe: {
      path: string;
      port: number;
      initialDelaySeconds: number;
      periodSeconds: number;
    };
    readinessProbe: {
      path: string;
      port: number;
      initialDelaySeconds: number;
      periodSeconds: number;
    };
  };
  ingress: {
    host: string;
    path: string;
    servicePort: number;
  }[];
}

export interface DeploymentConfig {
  docker: DockerConfig;
  kubernetes: KubernetesConfig;
  environment: 'development' | 'staging' | 'production';
}

export class DeploymentManager {
  private config: DeploymentConfig;

  constructor(config?: Partial<DeploymentConfig>) {
    this.config = {
      docker: {
        image: 'forever-ai',
        tag: 'latest',
        ports: [3000, 8080],
        volumes: ['./data:/app/data', './config:/app/config'],
        environment: {
          NODE_ENV: 'production',
          LOG_LEVEL: 'info',
        },
        networks: ['forever-ai-net'],
      },
      kubernetes: {
        namespace: 'forever-ai',
        replicas: 3,
        resources: {
          requests: {
            cpu: '500m',
            memory: '512Mi',
          },
          limits: {
            cpu: '2000m',
            memory: '2Gi',
          },
        },
        healthCheck: {
          livenessProbe: {
            path: '/health',
            port: 8080,
            initialDelaySeconds: 30,
            periodSeconds: 10,
          },
          readinessProbe: {
            path: '/health',
            port: 8080,
            initialDelaySeconds: 5,
            periodSeconds: 5,
          },
        },
        ingress: [
          {
            host: 'forever-ai.local',
            path: '/',
            servicePort: 80,
          },
        ],
      },
      environment: (process.env.NODE_ENV as any) || 'development',
      ...config,
    };
  }

  /**
   * 获取 Docker Compose 配置
   */
  getDockerComposeConfig(): string {
    const { docker } = this.config;
    return `version: '3.8'

services:
  forever-ai:
    image: ${docker.image}:${docker.tag}
    ports:
      ${docker.ports.map(p => `- "${p}:${p}"`).join('\n      ')}
    volumes:
      ${docker.volumes.map(v => `- ${v}`).join('\n      ')}
    environment:
      ${Object.entries(docker.environment).map(([k, v]) => `- ${k}=${v}`).join('\n      ')}
    networks:
      ${docker.networks.map(n => `- ${n}`).join('\n      ')}
    restart: unless-stopped

networks:
  forever-ai-net:
    driver: bridge
`;
  }

  /**
   * 获取 Kubernetes Deployment 配置
   */
  getKubernetesDeploymentConfig(): string {
    const { kubernetes, docker } = this.config;
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: forever-ai
  namespace: ${kubernetes.namespace}
spec:
  replicas: ${kubernetes.replicas}
  selector:
    matchLabels:
      app: forever-ai
  template:
    metadata:
      labels:
        app: forever-ai
    spec:
      containers:
      - name: forever-ai
        image: ${docker.image}:${docker.tag}
        ports:
        ${docker.ports.map(p => `- containerPort: ${p}`).join('\n        ')}
        resources:
          requests:
            cpu: ${kubernetes.resources.requests.cpu}
            memory: ${kubernetes.resources.requests.memory}
          limits:
            cpu: ${kubernetes.resources.limits.cpu}
            memory: ${kubernetes.resources.limits.memory}
        livenessProbe:
          httpGet:
            path: ${kubernetes.healthCheck.livenessProbe.path}
            port: ${kubernetes.healthCheck.livenessProbe.port}
          initialDelaySeconds: ${kubernetes.healthCheck.livenessProbe.initialDelaySeconds}
          periodSeconds: ${kubernetes.healthCheck.livenessProbe.periodSeconds}
        readinessProbe:
          httpGet:
            path: ${kubernetes.healthCheck.readinessProbe.path}
            port: ${kubernetes.healthCheck.readinessProbe.port}
          initialDelaySeconds: ${kubernetes.healthCheck.readinessProbe.initialDelaySeconds}
          periodSeconds: ${kubernetes.healthCheck.readinessProbe.periodSeconds}
`;
  }

  /**
   * 获取 Kubernetes Service 配置
   */
  getKubernetesServiceConfig(): string {
    const { kubernetes } = this.config;
    return `apiVersion: v1
kind: Service
metadata:
  name: forever-ai
  namespace: ${kubernetes.namespace}
spec:
  selector:
    app: forever-ai
  ports:
  - port: 80
    targetPort: 3000
    name: http
  type: ClusterIP
`;
  }

  /**
   * 获取 Kubernetes Ingress 配置
   */
  getKubernetesIngressConfig(): string {
    const { kubernetes } = this.config;
    return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: forever-ai
  namespace: ${kubernetes.namespace}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  ${kubernetes.ingress.map(i => `- host: ${i.host}
    http:
      paths:
      - path: ${i.path}
        pathType: Prefix
        backend:
          service:
            name: forever-ai
            port:
              number: ${i.servicePort}`).join('\n  ')}
`;
  }

  /**
   * 获取 Dockerfile 内容
   */
  getDockerfile(): string {
    return `FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建
RUN npm run build

# 暴露端口
EXPOSE 3000 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动命令
CMD ["npm", "start"]
`;
  }

  /**
   * 获取配置
   */
  getConfig(): DeploymentConfig {
    return this.config;
  }
}

// 单例实例
export const deploymentManager = new DeploymentManager();

