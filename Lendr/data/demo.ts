import type { BorrowRequest, LendItem, UserProfile } from "../types";

export const demoItems: LendItem[] = [
  {
    id: "item-drill",
    name: "DeWalt cordless drill",
    category: "Tools",
    photoUrl:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    distanceMiles: 0.3,
    available: true,
    maxBorrowDays: 4,
    owner: { id: "u-ava", firstName: "Ava" },
    latitude: 40.7279,
    longitude: -73.9829,
    lendWindowLabel: "Up to 4 days"
  },
  {
    id: "item-ladder",
    name: "6 ft folding ladder",
    category: "Tools",
    photoUrl:
      "https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?auto=format&fit=crop&w=1200&q=80",
    distanceMiles: 0.7,
    available: true,
    maxBorrowDays: 2,
    owner: { id: "u-marco", firstName: "Marco" },
    latitude: 40.7314,
    longitude: -73.9901,
    lendWindowLabel: "Weekend friendly"
  },
  {
    id: "item-mixer",
    name: "KitchenAid stand mixer",
    category: "Kitchen",
    photoUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    distanceMiles: 1.1,
    available: false,
    maxBorrowDays: 3,
    owner: { id: "u-nina", firstName: "Nina" },
    latitude: 40.7218,
    longitude: -73.9883,
    lendWindowLabel: "Up to 3 days"
  },
  {
    id: "item-tent",
    name: "Two-person camping tent",
    category: "Outdoor",
    photoUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
    distanceMiles: 1.6,
    available: true,
    maxBorrowDays: 7,
    owner: { id: "u-sam", firstName: "Sam" },
    latitude: 40.7351,
    longitude: -73.9771,
    lendWindowLabel: "Up to a week"
  }
];

export const demoRequests: BorrowRequest[] = [
  {
    id: "req-1",
    itemId: "item-drill",
    itemName: "DeWalt cordless drill",
    itemPhotoUrl: demoItems[0]!.photoUrl,
    borrowerName: "Jordan",
    ownerName: "You",
    status: "pending",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "req-2",
    itemId: "item-tent",
    itemName: "Two-person camping tent",
    itemPhotoUrl: demoItems[3]!.photoUrl,
    borrowerName: "You",
    ownerName: "Sam",
    status: "approved",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

export const demoProfile: UserProfile = {
  id: "demo-user",
  firstName: "Yash",
  listings: [
    {
      id: "my-sander",
      name: "Palm sander",
      category: "Tools",
      photoUrl:
        "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?auto=format&fit=crop&w=1200&q=80",
      distanceMiles: 0,
      available: true,
      maxBorrowDays: 3,
      owner: { id: "demo-user", firstName: "Yash" },
      lendWindowLabel: "Up to 3 days"
    },
    {
      id: "my-cooler",
      name: "Rolling cooler",
      category: "Outdoor",
      photoUrl:
        "https://images.unsplash.com/photo-1603606521793-2d188eb46e77?auto=format&fit=crop&w=1200&q=80",
      distanceMiles: 0,
      available: false,
      maxBorrowDays: 5,
      owner: { id: "demo-user", firstName: "Yash" },
      lendWindowLabel: "Up to 5 days"
    }
  ],
  incomingRequests: [demoRequests[0]!]
};
