import { RevenueDaily, RevenueWeekly } from "../../generated/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { decimalize } from "../utils/bignumbers";
import { getCurrentPrice } from "./SystemState";
import {
  increaseTotalLiquidationCompensation,
  increaseTotalLiquidationVolume,
  increaseTotalRedemptionFeesPaid,
  increaseTotalStabilityPoolProfits,
} from "./Global";

export class IUpdateRevenues {
  borrowFeeZUSD: BigInt = BigInt.zero();
  redemptionFeeRBTC: BigInt = BigInt.zero();
  stabilityPoolProfit: BigDecimal = BigDecimal.zero();
  liquidationVolume: BigInt = BigInt.zero();
  liquidationCompensation: BigInt = BigInt.zero();
  timestamp!: BigInt;
}

export function updateRevenues(data: IUpdateRevenues): void {
  let dayEntity = createAndReturnDayEntity(data.timestamp);
  let weekEntity = createAndReturnWeekEntity(data.timestamp);

  if (data.borrowFeeZUSD.gt(BigInt.zero())) {
    const decimalBorrowFeeZUSD = decimalize(data.borrowFeeZUSD);
    dayEntity.borrowFeeZUSD =
      dayEntity.borrowFeeZUSD.plus(decimalBorrowFeeZUSD);
    weekEntity.borrowFeeZUSD =
      weekEntity.borrowFeeZUSD.plus(decimalBorrowFeeZUSD);
  }

  if (data.redemptionFeeRBTC.gt(BigInt.zero())) {
    const decimalRedemptionFeeRBTC = decimalize(data.redemptionFeeRBTC);
    dayEntity.redemptionFeeRBTC = dayEntity.redemptionFeeRBTC.plus(
      decimalRedemptionFeeRBTC
    );
    weekEntity.redemptionFeeRBTC = weekEntity.redemptionFeeRBTC.plus(
      decimalRedemptionFeeRBTC
    );
    increaseTotalRedemptionFeesPaid(data.redemptionFeeRBTC);
  }

  if (data.liquidationVolume.gt(BigInt.zero())) {
    const decimalLiquidationVolume = decimalize(data.liquidationVolume);
    dayEntity.liquidationVolume = dayEntity.liquidationVolume.plus(
      decimalLiquidationVolume
    );
    weekEntity.liquidationVolume = weekEntity.liquidationVolume.plus(
      decimalLiquidationVolume
    );
    increaseTotalLiquidationVolume(data.liquidationVolume);
  }

  if (data.liquidationCompensation.gt(BigInt.zero())) {
    const decimalLiquidationCompensation = decimalize(
      data.liquidationCompensation
    );
    dayEntity.liquidationCompensation = dayEntity.liquidationCompensation.plus(
      decimalLiquidationCompensation
    );
    weekEntity.liquidationCompensation =
      weekEntity.liquidationCompensation.plus(decimalLiquidationCompensation);
    increaseTotalLiquidationCompensation(data.liquidationCompensation);
  }

  if (data.stabilityPoolProfit.gt(BigDecimal.zero())) {
    dayEntity.liquidationCompensation = dayEntity.stabilityPoolProfit.plus(
      data.stabilityPoolProfit
    );
    weekEntity.stabilityPoolProfit = weekEntity.stabilityPoolProfit.plus(
      data.stabilityPoolProfit
    );
    increaseTotalStabilityPoolProfits(data.stabilityPoolProfit);
  }

  dayEntity.save();
  weekEntity.save();
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
