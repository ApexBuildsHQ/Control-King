export interface RemoteButton {
id: string;
label: string;
code: string;
type?: 'IR' | 'WIFI';
}

export interface RemoteConfig {
categoryId: string;
brandId: string;
protocol: string;
frequency: number;
ipEndpoint?: string | null;
buttons: RemoteButton[];
}

export interface FavoriteItem {
id: string; // صيغة المعرف: categoryId_brandId
categoryId: string;
brandId: string;
title: string;
addedAt: number;
}
