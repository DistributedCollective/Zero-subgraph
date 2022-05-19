import { Value, BigInt, BigDecimal } from "@graphprotocol/graph-ts";

import { Global } from "../../generated/schema";

import { BIGINT_ZERO, DECIMAL_ZERO } from "../utils/bignumbers";
import { getCurrentPrice } from "./SystemState";

const onlyGlobalId = "only";

export function getGlobal(): Global {
  let globalOrNull = Global.load(onlyGlobalId);

  if (globalOrNull != null) {
    return globalOrNull as Global;
  } else {
    let newGlobal = new Global(onlyGlobalId);

    newGlobal.systemStateCount = 0;
    newGlobal.transactionCount = 0;
    newGlobal.changeCount = 0;
    newGlobal.liquidationCount = 0;
    newGlobal.redemptionCount = 0;
    newGlobal.numberOfOpenTroves = 0;
    newGlobal.numberOfLiquidatedTroves = 0;
    newGlobal.numberOfRedeemedTroves = 0;
    newGlobal.numberOfTrovesClosedByOwner = 0;
    newGlobal.totalNumberOfTroves = 0;
    newGlobal.rawTotalRedistributedCollateral = BIGINT_ZERO;
    newGlobal.rawTotalRedistributedDebt = BIGINT_ZERO;
    newGlobal.totalBorrowingFeesPaidZUSD = DECIMAL_ZERO;
    newGlobal.totalBorrowingFeesPaidRBTC = DECIMAL_ZERO;
    newGlobal.totalRedemptionFeesPaidRBTC = DECIMAL_ZERO;
    newGlobal.totalRedemptionFeesPaidZUSD = DECIMAL_ZERO;
    newGlobal.totalStabilityPoolProfits = DECIMAL_ZERO;
    newGlobal.totalLiquidationCompensation = DECIMAL_ZERO;
    newGlobal.totalLiquidationVolume = DECIMAL_ZERO;

    return newGlobal;
  }
}

function increaseCounter(key: string): i32 {
  let global = getGlobal();

  const countStr = global.get(key);
  if (countStr !== null) {
    const count = countStr.toI32();
    global.set(key, Value.fromI32(count + 1));
    global.save();
    return count;
  } else {
    return 0;
  }
}

export function getSystemStateSequenceNumber(): i32 {
  return increaseCounter("systemStateCount");
}

export function getTransactionSequenceNumber(): i32 {
  return increaseCounter("transactionCount");
}

export function getChangeSequenceNumber(): i32 {
  return increaseCounter("changeCount");
}

export function getLastChangeSequenceNumber(): i32 {
  let global = getGlobal();

  return global.changeCount - 1;
}

export function getLiquidationSequenceNumber(): i32 {
  return increaseCounter("liquidationCount");
}

export function getRedemptionSequenceNumber(): i32 {
  return increaseCounter("redemptionCount");
}

export function updateTotalRedistributed(
  L_ETH: BigInt,
  L_ZUSDDebt: BigInt
): void {
  let global = getGlobal();

  global.rawTotalRedistributedCollateral = L_ETH;
  global.rawTotalRedistributedDebt = L_ZUSDDebt;
  global.save();
}

export function increaseNumberOfOpenTroves(): void {
  let global = getGlobal();

  global.numberOfOpenTroves++;
  global.totalNumberOfTroves++;
  global.save();
}

export function increaseNumberOfLiquidatedTroves(): void {
  let global = getGlobal();

  global.numberOfLiquidatedTroves++;
  global.numberOfOpenTroves--;
  global.save();
}

export function decreaseNumberOfLiquidatedTroves(): void {
  let global = getGlobal();

  global.numberOfLiquidatedTroves--;
  global.numberOfOpenTroves++;
  global.save();
}

export function increaseNumberOfRedeemedTroves(): void {
  let global = getGlobal();

  global.numberOfRedeemedTroves++;
  global.numberOfOpenTroves--;
  global.save();
}

export function decreaseNumberOfRedeemedTroves(): void {
  let global = getGlobal();

  global.numberOfRedeemedTroves--;
  global.numberOfOpenTroves++;
  global.save();
}

export function increaseNumberOfTrovesClosedByOwner(): void {
  let global = getGlobal();

  global.numberOfTrovesClosedByOwner++;
  global.numberOfOpenTroves--;
  global.save();
}

export function decreaseNumberOfTrovesClosedByOwner(): void {
  let global = getGlobal();

  global.numberOfTrovesClosedByOwner--;
  global.numberOfOpenTroves++;
  global.save();
}

export function increaseTotalBorrowingFeesPaid(
  _ZUSDFee: BigDecimal,
  _ZUSDFeeInRbtc: BigDecimal
): void {
  let global = getGlobal();
  global.totalBorrowingFeesPaidZUSD =
    global.totalBorrowingFeesPaidZUSD.plus(_ZUSDFee);
  global.totalBorrowingFeesPaidRBTC =
    global.totalBorrowingFeesPaidRBTC.plus(_ZUSDFeeInRbtc);
  global.save();
}

export function increaseTotalRedemptionFeesPaid(
  _RBTCFee: BigDecimal,
  _RBTCFeeInZusd: BigDecimal
): void {
  let global = getGlobal();
  global.totalRedemptionFeesPaidRBTC =
    global.totalRedemptionFeesPaidRBTC.plus(_RBTCFee);
  global.totalRedemptionFeesPaidZUSD =
    global.totalBorrowingFeesPaidZUSD.plus(_RBTCFeeInZusd);
  global.save();
}

export function increaseTotalStabilityPoolProfits(profit: BigDecimal): void {
  let global = getGlobal();
  global.totalStabilityPoolProfits =
    global.totalStabilityPoolProfits.plus(profit);
  global.save();
}

export function decreaseTotalStabilityPoolProfits(
  profitChange: BigDecimal
): void {
  let global = getGlobal();
  global.totalStabilityPoolProfits =
    global.totalStabilityPoolProfits.minus(profitChange);
  global.save();
}

export function increaseTotalLiquidationCompensation(
  collateralGasCompensation: BigDecimal
): void {
  let global = getGlobal();
  global.totalLiquidationCompensation =
    global.totalLiquidationCompensation.plus(collateralGasCompensation);
  global.save();
}

export function increaseTotalLiquidationVolume(volume: BigDecimal): void {
  let global = getGlobal();
  global.totalLiquidationVolume = global.totalLiquidationVolume.plus(volume);
  global.save();
}
