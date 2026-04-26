export type Category = "Tools" | "Kitchen" | "Outdoor" | "Misc";
export type CategoryFilter = "All" | Category;
export type RadiusMiles = 0.5 | 1 | 2;
export type RequestStatus = "pending" | "approved" | "declined" | "returned";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Session = {
  userId: string;
  firstName: string;
  radiusMiles: RadiusMiles;
  location?: Coordinates;
  token?: string;
  expoPushToken?: string;
};

export type UserSummary = {
  id: string;
  firstName: string;
  avatarUrl?: string;
};

export type LendItem = {
  id: string;
  name: string;
  category: Category;
  photoUrl: string;
  distanceMiles: number;
  available: boolean;
  maxBorrowDays: number;
  owner: UserSummary;
  latitude?: number;
  longitude?: number;
  lendWindowLabel?: string;
};

export type BorrowRequest = {
  id: string;
  itemId: string;
  itemName: string;
  itemPhotoUrl: string;
  borrowerName: string;
  ownerName?: string;
  status: RequestStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  firstName: string;
  avatarUrl?: string;
  listings: LendItem[];
  incomingRequests: BorrowRequest[];
};
