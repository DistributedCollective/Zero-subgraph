import { BigInt } from '@graphprotocol/graph-ts';

import {
  UserDepositChanged,
  ETHGainWithdrawn,
  SOVPaidToDepositor,
} from '../../generated/StabilityPool/StabilityPool';

import { BIGINT_ZERO } from '../utils/bignumbers';

import {
  updateStabilityDeposit,
  withdrawCollateralGainFromStabilityDeposit,
} from '../entities/StabilityDeposit';

import { SOVDistribution, TempDepositUpdate } from '../../generated/schema';
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

export function handleSOVPaidToDepositor(event: SOVPaidToDepositor): void {
  let SOVDistributionEntity = new SOVDistribution(
    event.transaction.hash.toHexString()
  );

  SOVDistributionEntity.amount = event.params._SOV;
  SOVDistributionEntity.user = event.params._depositor;
  SOVDistributionEntity.save();
}
