import { ethereum, Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";

import {
  StabilityDepositChange,
  StabilityDeposit,
} from "../../generated/schema";

import { decimalize, DECIMAL_ZERO, BIGINT_ZERO } from "../utils/bignumbers";

import { beginChange, initChange, finishChange } from "./Change";
import { getUser } from "./User";
import { updateSystemStateByStabilityDepositChange } from "./SystemState";
import { CallSignatures } from "../utils/constants";

function getStabilityDeposit(_user: Address): StabilityDeposit {
  let id = _user.toHexString();
  let stabilityDepositOrNull = StabilityDeposit.load(id);

  if (stabilityDepositOrNull != null) {
    return stabilityDepositOrNull as StabilityDeposit;
  } else {
    let owner = getUser(_user);
    let newStabilityDeposit = new StabilityDeposit(id);

    newStabilityDeposit.owner = owner.id;
    newStabilityDeposit.depositedAmount = DECIMAL_ZERO;
    owner.stabilityDeposit = newStabilityDeposit.id;
    owner.save();

    return newStabilityDeposit;
  }
}

function createStabilityDepositChange(
  event: ethereum.Event
): StabilityDepositChange {
  let sequenceNumber = beginChange();
  let stabilityDepositChange = new StabilityDepositChange(
    sequenceNumber.toString()
  );
  initChange(stabilityDepositChange, event, sequenceNumber);

  return stabilityDepositChange;
}

function finishStabilityDepositChange(
  stabilityDepositChange: StabilityDepositChange
): void {
  finishChange(stabilityDepositChange);
  stabilityDepositChange.save();
}

function updateStabilityDepositByOperation(
  event: ethereum.Event,
  stabilityDeposit: StabilityDeposit,
  operation: string,
  newDepositedAmount: BigDecimal,
  collateralGain: BigDecimal | null = null
): void {
  let stabilityDepositChange = createStabilityDepositChange(event);

  stabilityDepositChange.stabilityDeposit = stabilityDeposit.id;
  stabilityDepositChange.blockNumber = event.block.number.toI32();
  stabilityDepositChange.stabilityDepositOperation = operation;
  stabilityDepositChange.depositedAmountBefore =
    stabilityDeposit.depositedAmount;

  stabilityDeposit.depositedAmount = newDepositedAmount;

  stabilityDepositChange.depositedAmountAfter =
    stabilityDeposit.depositedAmount;
  stabilityDepositChange.depositedAmountChange =
    stabilityDepositChange.depositedAmountAfter.minus(
      stabilityDepositChange.depositedAmountBefore
    );

  if (collateralGain !== null) {
    stabilityDepositChange.collateralGain = collateralGain;
  }

  stabilityDeposit.save();
  stabilityDepositChange.save();
  updateSystemStateByStabilityDepositChange(stabilityDepositChange);
  finishStabilityDepositChange(stabilityDepositChange);
}

export function updateStabilityDeposit(
  event: ethereum.Event,
  _user: Address,
  _amount: BigInt
): void {
  let stabilityDeposit = getStabilityDeposit(_user);
  let newDepositedAmount = decimalize(_amount);
  if (newDepositedAmount == stabilityDeposit.depositedAmount) {
    // Don't create a StabilityDepositChange when there's no change... duh.
    // It means user only wanted to withdraw collateral gains.
    return;
  }

  updateStabilityDepositByOperation(
    event,
    stabilityDeposit,
    newDepositedAmount > stabilityDeposit.depositedAmount
      ? "depositTokens"
      : "withdrawTokens",
    newDepositedAmount
  );

  stabilityDeposit.save();
}

export function withdrawCollateralGainFromStabilityDeposit(
  event: ethereum.Event,
  _user: Address,
  _ETH: BigInt,
  _ZUSDLoss: BigInt
): void {
  if (_ETH == BIGINT_ZERO && _ZUSDLoss == BIGINT_ZERO) {
    // Ignore "NOP" event
    return;
  }

  let stabilityDeposit = getStabilityDeposit(_user) as StabilityDeposit;
  let depositLoss = decimalize(_ZUSDLoss);
  let newDepositedAmount = stabilityDeposit.depositedAmount.minus(depositLoss);

  const callSig = event.transaction.input.toHexString().slice(0, 10);
  const operation =
    callSig == CallSignatures.withdrawETHGainToTrove
      ? "withdrawGainToLineOfCredit"
      : "withdrawCollateralGain";

  updateStabilityDepositByOperation(
    event,
    stabilityDeposit,
    operation,
    newDepositedAmount,
    decimalize(_ETH)
  );

  stabilityDeposit.save();
}
