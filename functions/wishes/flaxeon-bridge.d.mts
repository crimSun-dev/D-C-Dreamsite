export interface BridgeWish {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  priority?: string | null;
  owner?: string | null;
  isCompleted?: boolean | null;
}

export function slug(title: string): string;
export function memoryKey(wish: BridgeWish): string;
export function describe(wish: BridgeWish): string;
export function syncWish(wish: BridgeWish | undefined, previous?: BridgeWish): Promise<boolean>;
export function removeWishes(list: BridgeWish[]): Promise<boolean>;
export function syncAll(list: BridgeWish[]): Promise<boolean>;
