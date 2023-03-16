import { BigInt } from "@graphprotocol/graph-ts";
import { StabilityDepositVariable, Global } from "../../generated/schema";
import {
  EpochUpdated,
  G_Updated,
  P_Updated,
  S_Updated
} from "../../generated/StabilityPool/StabilityPool";
import { getGlobal, getLastChangeSequenceNumber } from "./Global";

const updateStabilityDepositVariable = (): {
  entity: StabilityDepositVariable;
  global: Global;
} => {
  const global = getGlobal();
  const spVariableId =
    global.currentSPVariable === null ? "-1" : global.currentSPVariable;
  const nextSpVariableId = parseInt(spVariableId) + 1;
  const systemStateSequenceNumber =
    global.currentSystemState === null
      ? -1
      : parseInt(global.currentSystemState);
  let entity = StabilityDepositVariable.load(spVariableId);
  let newEntity = new StabilityDepositVariable(nextSpVariableId.toString());
  if (entity === null) {
    newEntity._G = BigInt.zero();
    newEntity._P = BigInt.zero();
    newEntity._S = BigInt.zero();
    newEntity.epoch = BigInt.zero();
    newEntity.scale = BigInt.zero();
    newEntity.sumS = BigInt.zero();
  } else {
    newEntity._G = entity._G;
    newEntity._P = entity._P;
    newEntity._S = entity._S;
    newEntity.epoch = entity.epoch;
    newEntity.scale = entity.scale;
    newEntity.sumS = entity.sumS;
  }
  newEntity.systemStateSequenceNumber = systemStateSequenceNumber;
  global.currentSPVariable = nextSpVariableId.toString();
  return {
    entity: newEntity,
    global
  };
};

export const updateP = (event: P_Updated) => {
  const { entity, global } = updateStabilityDepositVariable();
  entity._P = event.params._P;
  entity.blockNumber = event.block.number.toI32();
  entity.save();
  global.save();
};

export const updateG = (event: G_Updated) => {
  const { entity, global } = updateStabilityDepositVariable();
  entity._G = event.params._G;
  entity.scale = event.params._scale;
  entity.epoch = event.params._epoch;
  entity.blockNumber = event.block.number.toI32();
  entity.save();
  global.save();
};

export const updateS = (event: S_Updated) => {
  const { entity, global } = updateStabilityDepositVariable();
  entity._S = event.params._S;
  entity.scale = event.params._scale;
  if (entity.epoch == event.params._epoch) {
    entity.sumS = entity.sumS.plus(event.params._S);
  } else {
    entity.sumS = event.params._S;
  }
  entity.epoch = event.params._epoch;
  entity.blockNumber = event.block.number.toI32();
  entity.save();
  global.save();
};

export const updateEpoch = (event: EpochUpdated) => {
  const { entity, global } = updateStabilityDepositVariable();
  entity.epoch = event.params._currentEpoch;
  entity.blockNumber = event.block.number.toI32();
  entity.save();
  global.save();
};
