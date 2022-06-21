import { Transfer, Approval } from "../../generated/ZUSDToken/ERC20";
import {
  updateStabilityPoolProfit,
  calculateStabilityPoolProfit,
  StabilityPoolProfitComponent,
} from "../entities/Revenue";
import { updateBalance } from "../entities/TokenBalance";
import { updateAllowance } from "../entities/TokenAllowance";
import { ZERO_ADDRESS } from "../utils/constants";
import { stabilityPoolAddress } from "../config/contracts";
import { createTransferTransaction } from "../entities/Transfer";

export function handleTokenTransfer(event: Transfer): void {
  updateBalance(event, event.params.from, event.params.to, event.params.value);
  createTransferTransaction(event);
  /** Check if tokens are burned from the stability pool */
  if (
    event.params.to.toHexString() == ZERO_ADDRESS &&
    /** TODO: Don't hard code this */
    event.params.from.toHexString() == stabilityPoolAddress.toLowerCase()
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
