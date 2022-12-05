import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

import {
  UserDepositChanged,
  ETHGainWithdrawn,
  RBTCGainWithdrawn
} from "../../generated/StabilityPool/StabilityPool";

import { BIGINT_ZERO, decimalize } from "../utils/bignumbers";

import { getGlobal } from "../entities/Global";

import {
  updateStabilityDeposit,
  withdrawCollateralGainFromStabilityDeposit
} from "../entities/StabilityDeposit";

import { Debug, TempDepositUpdate } from "../../generated/schema";
// Read the value of tmpDepositUpdate from the Global entity, and replace it with:
//  - null, if it wasn't null
//  - valueToSetIfNull if it was null
//
// Returns the value of tmpDepositUpdate before the swap.
function swapTmpDepositUpdate(
  valueToSetIfNull: BigInt,
  txHash: string
): BigInt | null {
  // let global = getGlobal();

  // let tmpDepositUpdate = global.tmpDepositUpdate;
  // global.tmpDepositUpdate = tmpDepositUpdate === null ? valueToSetIfNull : null;
  // global.save();

  // return tmpDepositUpdate;
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
    const debug = new Debug(
      event.transaction.index.toHexString() +
        "_" +
        event.transaction.hash.toHexString() +
        "_" +
        event.logIndex.toString() +
        "_handleUserDepositChanged"
    );
    debug.block = event.block.number.toI32();
    debug.debugValue = event.params._newDeposit.toString();
    debug.debugValueDescription = "handleUserDepositChanged";
    debug.save();

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
    const debug = new Debug(
      event.transaction.index.toHexString() +
        "_" +
        event.transaction.hash.toHexString() +
        "_" +
        event.logIndex.toString() +
        "_handleEthGainWithdrawn"
    );
    debug.block = event.block.number.toI32();
    debug.debugValue = depositUpdate.toString();
    debug.debugValueDescription = "handleETHGainWithdrawn()";
    debug.save();
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
    const debug = new Debug(
      event.transaction.index.toHexString() +
        "_" +
        event.transaction.hash.toHexString() +
        "_" +
        event.logIndex.toString() +
        "_handleRBTCGainWithdrawn"
    );
    debug.block = event.block.number.toI32();
    debug.debugValue = depositUpdate.toString();
    debug.debugValueDescription = "handleRBTCGainWithdrawn()";
    debug.save();
    updateStabilityDeposit(
      event,
      event.params._depositor,
      depositUpdate as BigInt
    );
  }
}
