import type { UserType } from "@/app/(auth)/auth";

type Entitlements = {
  maxMessagesTotal: number;
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  guest: {
    maxMessagesTotal: 1000,
  },
  regular: {
    maxMessagesTotal: 1000,
  },
};
