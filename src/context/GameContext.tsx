import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PenguinState, GameEnvironment, GameActions } from '@/shared/types';

interface GameState {
  penguins: PenguinState[];
  environment: GameEnvironment;
  stats: {
    fish: number;
    yarn: number;
    score: number;
    level: number;
    mood: number;
  };
  settings: {
    soundEnabled: boolean;
    aiEnabled: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
  };
  isLoading: boolean;
  error: string | null;
}

type GameAction = 
  | { type: 'ADD_PENGUIN'; penguin: PenguinState }
  | { type: 'UPDATE_PENGUIN'; id: string; updates: Partial<PenguinState> }
  | { type: 'REMOVE_PENGUIN'; id: string }
  | { type: 'UPDATE_STATS'; stats: Partial<GameState['stats']> }
  | { type: 'UPDATE_ENVIRONMENT'; environment: Partial<GameEnvironment> }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameState['settings']> }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

const initialState: GameState = {
  penguins: [],
  environment: {
    temperature: 20,
    humidity: 60,
    lightLevel: 80,
    noiseLevel: 30,
    crowdDensity: 0.3,
    items: {
      fish: [],
      yarn: [],
      decorations: []
    }
  },
  stats: {
    fish: 0,
    yarn: 0,
    score: 0,
    level: 1,
    mood: 70
  },
  settings: {
    soundEnabled: true,
    aiEnabled: true,
    difficulty: 'normal'
  },
  isLoading: false,
  error: null
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_PENGUIN':
      return {
        ...state,
        penguins: [...state.penguins, action.penguin]
      };
    
    case 'UPDATE_PENGUIN':
      return {
        ...state,
        penguins: state.penguins.map(penguin =>
          penguin.id === action.id
            ? { ...penguin, ...action.updates }
            : penguin
        )
      };
    
    case 'REMOVE_PENGUIN':
      return {
        ...state,
        penguins: state.penguins.filter(penguin => penguin.id !== action.id)
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.stats }
      };
    
    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        environment: { ...state.environment, ...action.environment }
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error
      };
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  actions: GameActions;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Game actions
  const actions: GameActions = {
    addPenguin: (penguin: PenguinState) => {
      dispatch({ type: 'ADD_PENGUIN', penguin });
    },
    
    updatePenguin: (id: string, updates: Partial<PenguinState>) => {
      dispatch({ type: 'UPDATE_PENGUIN', id, updates });
    },
    
    removePenguin: (id: string) => {
      dispatch({ type: 'REMOVE_PENGUIN', id });
    },
    
    updateStats: (stats: Partial<GameState['stats']>) => {
      dispatch({ type: 'UPDATE_STATS', stats });
    },
    
    updateEnvironment: (environment: Partial<GameEnvironment>) => {
      dispatch({ type: 'UPDATE_ENVIRONMENT', environment });
    },
    
    updateSettings: (settings: Partial<GameState['settings']>) => {
      dispatch({ type: 'UPDATE_SETTINGS', settings });
    },
    
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', loading });
    },
    
    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', error });
    },
    
    // Complex actions
    collectItem: async (penguinId: string, itemId: string, itemType: 'fish' | 'yarn') => {
      try {
        // Update penguin performance
        actions.updatePenguin(penguinId, {
          performance: {
            ...state.penguins.find(p => p.id === penguinId)?.performance,
            [itemType === 'fish' ? 'fishCollected' : 'yarnCollected']: 
              (state.penguins.find(p => p.id === penguinId)?.performance[
                itemType === 'fish' ? 'fishCollected' : 'yarnCollected'
              ] || 0) + 1
          }
        });
        
        // Update stats
        actions.updateStats({
          [itemType]: state.stats[itemType] + 1,
          score: state.stats.score + (itemType === 'fish' ? 10 : 25)
        });
        
        // Update mood
        actions.updateStats({
          mood: Math.min(100, state.stats.mood + (itemType === 'fish' ? 2 : 5))
        });
        
      } catch (error) {
        actions.setError('Failed to collect item');
      }
    },
    
    spawnItem: (itemType: 'fish' | 'yarn', position: { x: number; y: number; z: number }) => {
      const newItem = {
        id: `${itemType}_${Date.now()}_${Math.random()}`,
        type: itemType,
        position,
        createdAt: Date.now()
      };
      
      dispatch({
        type: 'UPDATE_ENVIRONMENT',
        environment: {
          items: {
            ...state.environment.items,
            [itemType]: [...state.environment.items[itemType], newItem]
          }
        }
      });
    },
    
    removeItem: (itemId: string, itemType: 'fish' | 'yarn') => {
      dispatch({
        type: 'UPDATE_ENVIRONMENT',
        environment: {
          items: {
            ...state.environment.items,
            [itemType]: state.environment.items[itemType].filter(item => item.id !== itemId)
          }
        }
      });
    }
  };

  // Auto-save game state
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('yarnPenguinGameState', JSON.stringify(state));
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [state]);

  // Load saved game state
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('yarnPenguinGameState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'UPDATE_STATS', stats: parsed.stats });
        dispatch({ type: 'UPDATE_SETTINGS', settings: parsed.settings });
      }
    } catch (error) {
      console.error('Failed to load saved game state:', error);
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}