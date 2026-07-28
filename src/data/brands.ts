import { Brand } from '../types';

export const GLOBAL_BRANDS: Brand[] = [
  {
    id: 'samsung',
    name: 'Samsung',
    logoIcon: 'fa-brands fa-square-js',
    categoryIds: ['tv', 'ac', 'smart_appliances', 'lighting_fans'],
    popular: true,
    country: 'South Korea',
    irProtocols: ['NEC', 'Samsung 32-bit'],
    modelsCount: 142
  },
  {
    id: 'lg',
    name: 'LG Electronics',
    logoIcon: 'fa-solid fa-tv',
    categoryIds: ['tv', 'ac', 'smart_appliances', 'lighting_fans'],
    popular: true,
    country: 'South Korea',
    irProtocols: ['NEC', 'LG 28-bit'],
    modelsCount: 128
  },
  {
    id: 'carrier',
    name: 'Carrier',
    logoIcon: 'fa-solid fa-snowflake',
    categoryIds: ['ac', 'smart_appliances'],
    popular: true,
    country: 'USA',
    irProtocols: ['Carrier HVAC 38kHz'],
    modelsCount: 86
  },
  {
    id: 'sharp',
    name: 'Sharp',
    logoIcon: 'fa-solid fa-bolt',
    categoryIds: ['tv', 'ac', 'smart_appliances', 'lighting_fans'],
    popular: true,
    country: 'Japan',
    irProtocols: ['Sharp Raw IR', 'NEC'],
    modelsCount: 94
  },
  {
    id: 'gree',
    name: 'Gree Electric',
    logoIcon: 'fa-solid fa-wind',
    categoryIds: ['ac', 'lighting_fans'],
    popular: true,
    country: 'China',
    irProtocols: ['Gree AC Protocol'],
    modelsCount: 110
  },
  {
    id: 'sony',
    name: 'Sony',
    logoIcon: 'fa-solid fa-play',
    categoryIds: ['tv', 'smart_appliances'],
    popular: true,
    country: 'Japan',
    irProtocols: ['Sony SIRC 12/15/20 bit'],
    modelsCount: 105
  },
  {
    id: 'panasonic',
    name: 'Panasonic',
    logoIcon: 'fa-solid fa-plug',
    categoryIds: ['tv', 'ac', 'smart_appliances', 'lighting_fans'],
    popular: true,
    country: 'Japan',
    irProtocols: ['Panasonic Old/New Protocol'],
    modelsCount: 98
  },
  {
    id: 'haier',
    name: 'Haier',
    logoIcon: 'fa-solid fa-temperature-arrow-down',
    categoryIds: ['tv', 'ac', 'smart_appliances'],
    popular: true,
    country: 'China',
    irProtocols: ['Haier AC/TV Protocol'],
    modelsCount: 88
  },
  {
    id: 'philips',
    name: 'Philips',
    logoIcon: 'fa-solid fa-lightbulb',
    categoryIds: ['tv', 'lighting_fans', 'smart_appliances'],
    popular: true,
    country: 'Netherlands',
    irProtocols: ['RC5', 'RC6'],
    modelsCount: 92
  },
  {
    id: 'tcl',
    name: 'TCL Smart',
    logoIcon: 'fa-solid fa-desktop',
    categoryIds: ['tv', 'ac', 'smart_appliances'],
    popular: true,
    country: 'China',
    irProtocols: ['NEC', 'TCL Custom IR'],
    modelsCount: 84
  },
  {
    id: 'daikin',
    name: 'Daikin',
    logoIcon: 'fa-solid fa-fan',
    categoryIds: ['ac'],
    popular: true,
    country: 'Japan',
    irProtocols: ['Daikin 200-bit AC'],
    modelsCount: 76
  },
  {
    id: 'toshiba',
    name: 'Toshiba',
    logoIcon: 'fa-solid fa-microchip',
    categoryIds: ['tv', 'ac', 'smart_appliances'],
    popular: false,
    country: 'Japan',
    irProtocols: ['NEC', 'Toshiba AC'],
    modelsCount: 64
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi Electric',
    logoIcon: 'fa-solid fa-asterisk',
    categoryIds: ['ac', 'smart_appliances', 'lighting_fans'],
    popular: false,
    country: 'Japan',
    irProtocols: ['Mitsubishi Heavy AC'],
    modelsCount: 72
  },
  {
    id: 'hisense',
    name: 'Hisense',
    logoIcon: 'fa-solid fa-display',
    categoryIds: ['tv', 'ac', 'smart_appliances'],
    popular: true,
    country: 'China',
    irProtocols: ['Hisense Smart TV IR'],
    modelsCount: 80
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi Mi / Smart',
    logoIcon: 'fa-solid fa-mobile-screen',
    categoryIds: ['tv', 'ac', 'smart_appliances', 'lighting_fans'],
    popular: true,
    country: 'China',
    irProtocols: ['Mi IR / Smart Home Wi-Fi'],
    modelsCount: 115
  },
  {
    id: 'bosch',
    name: 'Bosch',
    logoIcon: 'fa-solid fa-kitchen-set',
    categoryIds: ['smart_appliances', 'ac'],
    popular: false,
    country: 'Germany',
    irProtocols: ['Bosch Smart IR'],
    modelsCount: 58
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool',
    logoIcon: 'fa-solid fa-rotate',
    categoryIds: ['smart_appliances', 'ac'],
    popular: false,
    country: 'USA',
    irProtocols: ['Whirlpool AC/Appliance'],
    modelsCount: 62
  },
  {
    id: 'kenwood',
    name: 'Kenwood',
    logoIcon: 'fa-solid fa-sliders',
    categoryIds: ['smart_appliances', 'ac'],
    popular: false,
    country: 'UK',
    irProtocols: ['NEC Standard'],
    modelsCount: 45
  }
];
