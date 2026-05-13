import { useEffect } from "react";
import { useRewardStore } from "@/store/rewardStore";

export function RewardGate() {
  const hydrateRewards = useRewardStore((state) => state.hydrateRewards);

  useEffect(() => {
    void hydrateRewards();
  }, [hydrateRewards]);

  return null;
}
