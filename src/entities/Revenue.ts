import {
  PriceChange,
  RevenueDaily,
  RevenueWeekly,
} from "../../generated/schema";
import { bigDecimal, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { decimalize } from "../utils/bignumbers";
import { getCurrentPrice } from "./SystemState";
import {
  increaseTotalLiquidationCompensation,
  increaseTotalLiquidationVolume,
  increaseTotalRedemptionFeesPaid,
  increaseTotalStabilityPoolProfits,
  increaseTotalBorrowingFeesPaid,
} from "./Global";

export class IUpdateRevenues {
  amount!: BigDecimal;
  timestamp!: BigInt;
}

class RevenueEntities {
  day: RevenueDaily;
  week: RevenueWeekly;
}

function getRevenueEntities(timestamp: BigInt): RevenueEntities {
  return {
    day: createAndReturnDayEntity(timestamp),
    week: createAndReturnWeekEntity(timestamp),
  };
}

function saveRevenueEntities(entities: RevenueEntities): void {
  entities.day.save();
  entities.week.save();
}

export function updateBorrowFee(data: IUpdateRevenues): void {
  const revenueEntities = getRevenueEntities(data.timestamp);
  const price = getCurrentPrice();
  const feeConvertedToRBTC = data.amount.div(price);
  revenueEntities.day.borrowFeeZUSD = revenueEntities.day.borrowFeeZUSD.plus(
    data.amount
  );
  revenueEntities.week.borrowFeeZUSD = revenueEntities.week.borrowFeeZUSD.plus(
    data.amount
  );
  revenueEntities.day.borrowFeeRBTC =
    revenueEntities.day.borrowFeeRBTC.plus(feeConvertedToRBTC);
  revenueEntities.week.borrowFeeRBTC =
    revenueEntities.week.borrowFeeRBTC.plus(feeConvertedToRBTC);
  increaseTotalBorrowingFeesPaid(data.amount, feeConvertedToRBTC);
  saveRevenueEntities(revenueEntities);
}

export function updateRedemptionFee(data: IUpdateRevenues): void {
  const revenueEntities = getRevenueEntities(data.timestamp);
  const price = getCurrentPrice();
  const feeConvertedToZUSD = data.amount.times(price);

  revenueEntities.day.redemptionFeeRBTC =
    revenueEntities.day.redemptionFeeRBTC.plus(data.amount);
  revenueEntities.week.redemptionFeeRBTC =
    revenueEntities.week.redemptionFeeRBTC.plus(data.amount);

  revenueEntities.day.redemptionFeeZUSD =
    revenueEntities.day.redemptionFeeZUSD.plus(feeConvertedToZUSD);
  revenueEntities.week.redemptionFeeZUSD =
    revenueEntities.week.redemptionFeeZUSD.plus(feeConvertedToZUSD);

  increaseTotalRedemptionFeesPaid(data.amount, feeConvertedToZUSD);
  saveRevenueEntities(revenueEntities);
}

export function updateLiquidationVolume(data: IUpdateRevenues): void {
  const revenueEntities = getRevenueEntities(data.timestamp);
  revenueEntities.day.liquidationVolume =
    revenueEntities.day.liquidationVolume.plus(data.amount);
  revenueEntities.week.liquidationVolume =
    revenueEntities.week.liquidationVolume.plus(data.amount);
  increaseTotalLiquidationVolume(data.amount);
  saveRevenueEntities(revenueEntities);
}

export function updateLiquidationCompensation(data: IUpdateRevenues): void {
  const revenueEntities = getRevenueEntities(data.timestamp);
  revenueEntities.day.liquidationCompensation =
    revenueEntities.day.liquidationCompensation.plus(data.amount);
  revenueEntities.week.liquidationCompensation =
    revenueEntities.week.liquidationCompensation.plus(data.amount);
  increaseTotalLiquidationCompensation(data.amount);
  saveRevenueEntities(revenueEntities);
}

export function updateStabilityPoolProfit(data: IUpdateRevenues): void {
  const revenueEntities = getRevenueEntities(data.timestamp);
  revenueEntities.day.stabilityPoolProfit =
    revenueEntities.day.stabilityPoolProfit.plus(data.amount);
  revenueEntities.week.stabilityPoolProfit =
    revenueEntities.week.stabilityPoolProfit.plus(data.amount);
  increaseTotalStabilityPoolProfits(data.amount);
  saveRevenueEntities(revenueEntities);
}

export enum StabilityPoolProfitComponent {
  RbtcCollateral,
  ZusdDebt,
}

export function calculateStabilityPoolProfit(
  type: StabilityPoolProfitComponent,
  amount: BigInt
): BigDecimal {
  const price = getCurrentPrice();
  if (amount.gt(BigInt.zero()) && price.gt(BigDecimal.zero())) {
    if (type === StabilityPoolProfitComponent.RbtcCollateral) {
      return decimalize(amount);
    } else if (type === StabilityPoolProfitComponent.ZusdDebt) {
      return decimalize(amount).div(price).neg();
    }
  }
  return BigDecimal.zero();
}

function createAndReturnDayEntity(timestamp: BigInt): RevenueDaily {
  const dayEntityTimestamp =
    timestamp.toI32() - (timestamp.toI32() % (24 * 60 * 60));

  let dayEntity = RevenueDaily.load(dayEntityTimestamp.toString());

  if (dayEntity === null) {
    dayEntity = new RevenueDaily(dayEntityTimestamp.toString());
    dayEntity.borrowFeeRBTC = BigDecimal.zero();
    dayEntity.borrowFeeZUSD = BigDecimal.zero();
    dayEntity.redemptionFeeRBTC = BigDecimal.zero();
    dayEntity.redemptionFeeZUSD = BigDecimal.zero();
    dayEntity.stabilityPoolProfit = BigDecimal.zero();
    dayEntity.liquidationVolume = BigDecimal.zero();
    dayEntity.liquidationCompensation = BigDecimal.zero();
    dayEntity.periodStartUnix = BigInt.fromI32(dayEntityTimestamp);
  }

  return dayEntity;
}

function createAndReturnWeekEntity(timestamp: BigInt): RevenueWeekly {
  const weekEntityTimestamp =
    timestamp.toI32() - (timestamp.toI32() % (24 * 60 * 60 * 7));

  let weekEntity = RevenueWeekly.load(weekEntityTimestamp.toString());

  if (weekEntity === null) {
    weekEntity = new RevenueWeekly(weekEntityTimestamp.toString());
    weekEntity.borrowFeeRBTC = BigDecimal.zero();
    weekEntity.borrowFeeZUSD = BigDecimal.zero();
    weekEntity.redemptionFeeRBTC = BigDecimal.zero();
    weekEntity.redemptionFeeZUSD = BigDecimal.zero();
    weekEntity.stabilityPoolProfit = BigDecimal.zero();
    weekEntity.liquidationVolume = BigDecimal.zero();
    weekEntity.liquidationCompensation = BigDecimal.zero();
    weekEntity.periodStartUnix = BigInt.fromI32(weekEntityTimestamp);
  }

  return weekEntity;
}
