import { Transfer, Approval } from "../../generated/ZUSDToken/ERC20";
import {
  updateStabilityPoolProfit,
  calculateStabilityPoolProfit,
  StabilityPoolProfitComponent,
} from "../entities/Revenue";
import { updateBalance } from "../entities/TokenBalance";
import { updateAllowance } from "../entities/TokenAllowance";
import { ZERO_ADDRESS } from "../utils/constants";

export function handleTokenTransfer(event: Transfer): void {
  updateBalance(event, event.params.from, event.params.to, event.params.value);

  /** Check if tokens are burned from the stability pool */
  if (
    event.params.to.toHexString() == ZERO_ADDRESS &&
    /** TODO: Don't hard code this */
    event.params.from.toHexString() ==
      "0x0dcedf5e080ed1d58b27b030d042d60971408d26" //Stability pool address
  ) {
    const profit = calculateStabilityPoolProfit(
      StabilityPoolProfitComponent.ZusdDebt,
      event.params.value
    );
    updateStabilityPoolProfit({
      amount: profit,
      timestamp: event.block.timestamp,
    });
  }
}

export function handleTokenApproval(event: Approval): void {
  updateAllowance(
    event,
    event.params.owner,
    event.params.spender,
    event.params.value
  );
}
