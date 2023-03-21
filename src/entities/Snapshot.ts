import { bigInt, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Snapshot,
  StabilityDeposit,
  StabilityDepositVariable
} from "../../generated/schema";
import { DepositSnapshotUpdated } from "../../generated/StabilityPool/StabilityPool";
import { BIGINT_SCALING_FACTOR } from "../utils/bignumbers";
import { getGlobal, getLastChangeSequenceNumber } from "./Global";

export function createAndReturnSnapshot(
  event: DepositSnapshotUpdated
): Snapshot {
  const systemState = getLastChangeSequenceNumber();
  const snapshot = new Snapshot(
    event.transaction.hash.toHexString() + "_" + event.logIndex.toString()
  );
  snapshot.depositor = event.params._depositor.toHexString();
  snapshot._P = event.params._P;
  snapshot._S = event.params._S;
  snapshot._G = event.params._G;
  snapshot.timestamp = event.block.timestamp.toI32();
  snapshot.blockNumber = event.block.number.toI32();
  snapshot.systemStateSequenceNumber = systemState;
  snapshot.save();

  const depositor = StabilityDeposit.load(
    event.params._depositor.toHexString()
  );
  if (depositor !== null) {
    depositor.currentSnapshot = snapshot.id;
    depositor.save();
  }

  return snapshot;
}

export function createInitialSnapshot(user: string): void {
  /** Create snapshot */
  const global = getGlobal();
  const currentSPVariable = global.currentSPVariable;
  const currentSystemState = global.currentSystemState;
  const snapshot = new Snapshot(user);
  snapshot.depositor = user;
  if (currentSystemState !== null) {
    if (currentSPVariable !== null) {
      const spVariable = StabilityDepositVariable.load(currentSPVariable);
      if (spVariable !== null) {
        snapshot._P = spVariable._P;
        snapshot._S = spVariable._S;
        snapshot._G = spVariable._G;
      }
    } else {
      snapshot._P = BIGINT_SCALING_FACTOR;
      snapshot._S = BIGINT_SCALING_FACTOR;
      snapshot._G = BIGINT_SCALING_FACTOR;
    }
    snapshot.timestamp = 0;
    snapshot.blockNumber = 0;
    snapshot.systemStateSequenceNumber = parseInt(currentSystemState) as i32;
    snapshot.save();
  }
}
