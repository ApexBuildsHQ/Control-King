export type AppCategory = 'tv' | 'ac' | 'smart_appliances' | 'lighting_fans';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export interface Brand {
  id: string;
  name: string;
  logoIcon?: string;
  categoryIds: AppCategory[];
  popular?: boolean;
  country?: string;
  irProtocols?: string[];
  modelsCount?: number;
}

export interface RemoteState {
  power: boolean;
  volume: number;
  channel: number;
  temperature: number;
  mode: 'cool' | 'heat' | 'auto' | 'dry' | 'fan';
  fanSpeed: 'low' | 'med' | 'high' | 'auto';
  swing: boolean;
  muted: boolean;
  brightness: number;
  colorTemp: number; // 2700K - 6500K
  rgbColor: string;
  inputSource: string;
  freezerTemp: number;
  fridgeTemp: number;
  ecoMode: boolean;
}

export interface IRSignalLog {
  id: string;
  timestamp: string;
  command: string;
  hexCode: string;
  protocol: string;
  frequency: string;
}

export interface FavoriteRemote {
  id: string;
  brandId: string;
  brandName: string;
  categoryId: AppCategory;
  modelName: string;
  addedAt: string;
}

export interface CustomButton {
  id: string;
  label: string;
  iconName?: string;
  hexCode: string;
  color?: string;
}
