import { BigInt } from "@graphprotocol/graph-ts";
import { StabilityDepositVariable } from "../../generated/schema";
import { getLastChangeSequenceNumber } from "./Global";

export const createOrUpdateStabilityDepositVariable = (
  blockNumber: i32
): StabilityDepositVariable => {
  const systemStateSequenceNumber = getLastChangeSequenceNumber();
  let entity = StabilityDepositVariable.load("only");
  if (entity === null) {
    entity = new StabilityDepositVariable("only");
    entity._G = BigInt.zero();
    entity._P = BigInt.zero();
    entity._S = BigInt.zero();
    entity.epoch = BigInt.zero();
    entity.scale = BigInt.zero();
    entity.sumS = BigInt.zero();
    entity.systemStateSequenceNumber = systemStateSequenceNumber;
    entity.blockNumber = blockNumber;
    entity.save();
  } else {
    entity.systemStateSequenceNumber = systemStateSequenceNumber;
    entity.blockNumber = blockNumber;
  }
  return entity;
};
