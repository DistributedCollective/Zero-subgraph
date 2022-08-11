import {
  TroveUpdated,
  TroveLiquidated,
  Liquidation,
  Redemption,
  LTermsUpdated,
} from "../../generated/TroveManager/TroveManager";

import { getTroveOperationFromTroveManagerOperation } from "../types/TroveOperation";

import { finishCurrentLiquidation } from "../entities/Liquidation";
import { finishCurrentRedemption } from "../entities/Redemption";
import {
  applyRedistributionToTroveBeforeLiquidation,
  updateTrove,
} from "../entities/Trove";
import { updateTotalRedistributed } from "../entities/Global";
import {
  IUpdateRevenues,
  updateLiquidationCompensation,
  updateLiquidationVolume,
  updateRedemptionFee,
} from "../entities/Revenue";
import { decimalize } from "../utils/bignumbers";
import { BigDecimal } from "@graphprotocol/graph-ts";
import { RedemptionRaw } from "../../generated/schema";

export function handleTroveUpdated(event: TroveUpdated): void {
  updateTrove(
    event,
    getTroveOperationFromTroveManagerOperation(event.params.operation),
    event.params._borrower,
    event.params._coll,
    event.params._debt,
    event.params.stake
  );
}

export function handleTroveLiquidated(event: TroveLiquidated): void {
  applyRedistributionToTroveBeforeLiquidation(event, event.params._borrower);
  // No need to close the Trove yet, as TroveLiquidated will be followed by a TroveUpdated event
  // that sets collateral and debt to 0.
}

export function handleLiquidation(event: Liquidation): void {
  finishCurrentLiquidation(
    event,
    event.params._liquidatedColl,
    event.params._liquidatedDebt,
    event.params._collGasCompensation,
    event.params._ZUSDGasCompensation
  );

  let liquidationVolumeData = new IUpdateRevenues();
  liquidationVolumeData.amount = decimalize(event.params._liquidatedColl);
  liquidationVolumeData.timestamp = event.block.timestamp;
  updateLiquidationVolume(liquidationVolumeData);

  let liquidationCompensationData = new IUpdateRevenues();
  liquidationCompensationData.amount = decimalize(
    event.params._collGasCompensation
  );
  liquidationCompensationData.timestamp = event.block.timestamp;
  updateLiquidationCompensation(liquidationCompensationData);
}

export function handleRedemption(event: Redemption): void {
  let redemptionRawEntity = new RedemptionRaw(
    event.transaction.hash.toHexString() + "_" + event.logIndex.toHexString()
  );
  redemptionRawEntity._attemptedZUSDAmount = event.params._attemptedZUSDAmount;
  redemptionRawEntity._actualZUSDAmount = event.params._actualZUSDAmount;
  redemptionRawEntity._RBTCFee = event.params._RBTCFee;
  redemptionRawEntity._RBTCSent = event.params._RBTCSent;
  redemptionRawEntity.save();

  finishCurrentRedemption(
    event,
    event.params._attemptedZUSDAmount,
    event.params._actualZUSDAmount,
    event.params._RBTCSent,
    event.params._RBTCFee
  );

  let revenueData = new IUpdateRevenues();
  revenueData.amount = decimalize(event.params._RBTCFee);
  revenueData.timestamp = event.block.timestamp;

  updateRedemptionFee(revenueData);
}

export function handleLTermsUpdated(event: LTermsUpdated): void {
  updateTotalRedistributed(event.params._L_RBTC, event.params._L_ZUSDDebt);
}
