import { EtherSent as EtherSentEvent } from "../../generated/ActivePool/ActivePool";

import {
  updateStabilityPoolProfit,
  calculateStabilityPoolProfit,
  StabilityPoolProfitComponent,
} from "../entities/Revenue";

export function handleEtherSent(event: EtherSentEvent): void {
  /** TODO: Don't hardcode this */
  if (
    event.params._to.toHexString() ==
    "0x0dcedf5e080ed1d58b27b030d042d60971408d26" //Stability Pool address
  ) {
    /** Update stability pool profit */
    const profit = calculateStabilityPoolProfit(
      StabilityPoolProfitComponent.RbtcCollateral,
      event.params._amount
    );
    updateStabilityPoolProfit({
      amount: profit,
      timestamp: event.block.timestamp,
    });
  }
}
