import { BigInt } from "@graphprotocol/graph-ts";

import {
  UserDepositChanged,
  ETHGainWithdrawn,
  RBTCGainWithdrawn,
  DepositSnapshotUpdated,
  S_Updated,
  G_Updated,
  P_Updated,
  EpochUpdated
} from "../../generated/StabilityPool/StabilityPool";

import { BIGINT_ZERO } from "../utils/bignumbers";

import {
  updateStabilityDeposit,
  withdrawCollateralGainFromStabilityDeposit
} from "../entities/StabilityDeposit";

import { Snapshot, TempDepositUpdate } from "../../generated/schema";
import { createOrUpdateStabilityDepositVariable } from "../entities/StabilityDepositVariable";
import { createAndReturnSnapshot } from "../entities/Snapshot";
// Read the value of tmpDepositUpdate from the Global entity, and replace it with:
//  - null, if it wasn't null
//  - valueToSetIfNull if it was null
//
// Returns the value of tmpDepositUpdate before the swap.
function swapTmpDepositUpdate(
  valueToSetIfNull: BigInt,
  txHash: string
): BigInt | null {
  let tmpDepositEntity = TempDepositUpdate.load(txHash);
  if (tmpDepositEntity != null) {
    const amount = tmpDepositEntity.amount;
    tmpDepositEntity.amount = null;
    tmpDepositEntity.save();
    return amount;
  } else {
    tmpDepositEntity = new TempDepositUpdate(txHash);
    tmpDepositEntity.amount = valueToSetIfNull;
    tmpDepositEntity.save();
    return null;
  }
}

export function handleUserDepositChanged(event: UserDepositChanged): void {
  let ethGainWithdrawn = swapTmpDepositUpdate(
    event.params._newDeposit,
    event.transaction.hash.toHexString()
  );
  if (ethGainWithdrawn !== null) {
    updateStabilityDeposit(
      event,
      event.params._depositor,
      event.params._newDeposit
    );
  }
}

export function handleETHGainWithdrawn(event: ETHGainWithdrawn): void {
  // Leave a non-null dummy value to signal to handleUserDepositChanged()
  // that ETH gains have been withdrawn
  let depositUpdate = swapTmpDepositUpdate(
    BIGINT_ZERO,
    event.transaction.hash.toHexString()
  );

  withdrawCollateralGainFromStabilityDeposit(
    event,
    event.params._depositor,
    event.params._ETH,
    event.params._ZUSDLoss
  );

  if (depositUpdate !== null) {
    updateStabilityDeposit(
      event,
      event.params._depositor,
      depositUpdate as BigInt
    );
  }
}

export function handleRBTCGainWithdrawn(event: RBTCGainWithdrawn): void {
  // Leave a non-null dummy value to signal to handleUserDepositChanged()
  // that ETH gains have been withdrawn
  let depositUpdate = swapTmpDepositUpdate(
    BIGINT_ZERO,
    event.transaction.hash.toHexString()
  );

  withdrawCollateralGainFromStabilityDeposit(
    event,
    event.params._depositor,
    event.params._RBTC,
    event.params._ZUSDLoss
  );

  if (depositUpdate !== null) {
    updateStabilityDeposit(
      event,
      event.params._depositor,
      depositUpdate as BigInt
    );
  }
}

export function handleDepositSnapshotUpdated(
  event: DepositSnapshotUpdated
): void {
  createAndReturnSnapshot(event);
}

export function handlePUpdated(event: P_Updated): void {
  const variableEntity = createOrUpdateStabilityDepositVariable(
    event.block.number.toI32()
  );
  variableEntity._P = event.params._P;
  variableEntity.save();
}

export function handleSUpdated(event: S_Updated): void {
  const variableEntity = createOrUpdateStabilityDepositVariable(
    event.block.number.toI32()
  );
  variableEntity._S = event.params._S;
  variableEntity.scale = event.params._scale;
  if (variableEntity.epoch == event.params._epoch) {
    variableEntity.sumS = variableEntity.sumS.plus(event.params._S);
  } else {
    variableEntity.sumS = event.params._S;
  }
  variableEntity.epoch = event.params._epoch;
  variableEntity.save();
}

export function handleGUpdated(event: G_Updated): void {
  const variableEntity = createOrUpdateStabilityDepositVariable(
    event.block.number.toI32()
  );
  variableEntity._G = event.params._G;
  variableEntity.scale = event.params._scale;
  variableEntity.epoch = event.params._epoch;
  variableEntity.save();
}

export function handleEpochUpdated(event: EpochUpdated): void {
  const variableEntity = createOrUpdateStabilityDepositVariable(
    event.block.number.toI32()
  );
  variableEntity.epoch = event.params._currentEpoch;
  variableEntity.save();
}
