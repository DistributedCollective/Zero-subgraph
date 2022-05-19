import { EtherSent as EtherSentEvent } from "../../generated/ActivePool/ActivePool";

import {
  updateStabilityPoolProfit,
  calculateStabilityPoolProfit,
  StabilityPoolProfitComponent,
} from "../entities/Revenue";
import { stabilityPoolAddress } from "../config/contracts";

export function handleEtherSent(event: EtherSentEvent): void {
  /** TODO: Don't hardcode this */
  if (event.params._to.toHexString() == stabilityPoolAddress.toLowerCase()) {
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
