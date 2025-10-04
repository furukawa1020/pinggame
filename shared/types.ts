// Shared types for both frontend and backend

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PenguinState {
  id: string;
  position: Vector3;
  rotation: Vector3;
  happiness: number;
  energy: number;
  currentAction: 'idle' | 'moving' | 'collecting' | 'socializing' | 'resting';
  targetPosition?: Vector3;
  color: string;
  size: number;
  personality: {
    curiosity: number;
    sociability: number;
    energy: number;
    intelligence: number;
  };
  performance: {
    fishCollected: number;
    yarnCollected: number;
    socialInteractions: number;
    efficiency: number;
    totalScore: number;
  };
  memory: number[];
  aiEnabled: boolean;
  lastUpdate: number;
}

export interface GameItem {
  id: string;
  type: 'fish' | 'yarn' | 'decoration';
  position: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  color?: string;
  value?: number;
  createdAt: number;
  collected?: boolean;
}

export interface GameEnvironment {
  temperature: number;
  humidity: number;
  lightLevel: number;
  noiseLevel: number;
  crowdDensity: number;
  items: {
    fish: GameItem[];
    yarn: GameItem[];
    decorations: GameItem[];
  };
  effects?: {
    particles: ParticleEffect[];
    weather: WeatherEffect;
  };
}

export interface ParticleEffect {
  id: string;
  type: 'sparkle' | 'yarn' | 'happiness' | 'collection';
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface WeatherEffect {
  type: 'sunny' | 'cloudy' | 'snowy' | 'magical';
  intensity: number;
  duration: number;
}

export interface AIDecision {
  action: 'move' | 'collect' | 'socialize' | 'rest';
  target?: Vector3;
  confidence: number;
  reasoning: string;
  priority: number;
}

export interface GameActions {
  // Penguin actions
  addPenguin: (penguin: PenguinState) => void;
  updatePenguin: (id: string, updates: Partial<PenguinState>) => void;
  removePenguin: (id: string) => void;
  
  // Game state actions
  updateStats: (stats: any) => void;
  updateEnvironment: (environment: Partial<GameEnvironment>) => void;
  updateSettings: (settings: any) => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Complex actions
  collectItem: (penguinId: string, itemId: string, itemType: 'fish' | 'yarn') => Promise<void>;
  spawnItem: (itemType: 'fish' | 'yarn', position: Vector3) => void;
  removeItem: (itemId: string, itemType: 'fish' | 'yarn') => void;
}

export interface SocketEvents {
  // Client to Server
  'join-game': (playerData: any) => void;
  'penguin-action': (actionData: any) => void;
  'train-ai': (trainingData: any) => void;
  
  // Server to Client
  'game-joined': (gameRoom: any) => void;
  'action-result': (result: any) => void;
  'ai-decision': (decision: AIDecision) => void;
  'training-complete': (result: any) => void;
  'game-update': (gameState: any) => void;
  'error': (error: { message: string }) => void;
}

export interface GameRoom {
  id: string;
  players: string[];
  gameState: {
    penguins: PenguinState[];
    environment: GameEnvironment;
    stats: any;
  };
  settings: {
    maxPlayers: number;
    aiEnabled: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
  };
  createdAt: number;
  lastUpdate: number;
}

export interface TrainingData {
  penguinId: string;
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

export interface AIModelConfig {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  learningRate: number;
  batchSize: number;
  memorySize: number;
}

export interface GameConfig {
  maxPenguins: number;
  maxItems: number;
  spawnRates: {
    fish: number;
    yarn: number;
  };
  aiConfig: AIModelConfig;
  graphics: {
    particleCount: number;
    shadowQuality: 'low' | 'medium' | 'high';
    enablePostProcessing: boolean;
  };
}

// Utility types
export type GameEventType = 
  | 'penguin-spawn'
  | 'item-collect'
  | 'ai-decision'
  | 'achievement'
  | 'level-up'
  | 'error';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: any;
}

// AI specific types
export interface NeuralNetworkLayer {
  type: 'dense' | 'dropout' | 'batchNorm';
  units?: number;
  activation?: string;
  rate?: number;
}

export interface ModelArchitecture {
  layers: NeuralNetworkLayer[];
  optimizer: {
    type: 'adam' | 'sgd' | 'rmsprop';
    learningRate: number;
    beta1?: number;
    beta2?: number;
  };
  loss: string;
  metrics: string[];
}