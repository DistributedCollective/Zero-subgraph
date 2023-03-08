import { Snapshot, StabilityDeposit } from "../../generated/schema";
import { DepositSnapshotUpdated } from "../../generated/StabilityPool/StabilityPool";
import { getSystemStateSequenceNumber } from "./Global";

export function createAndReturnSnapshot(
  event: DepositSnapshotUpdated
): Snapshot {
  const systemState = getSystemStateSequenceNumber();
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
  }

  return snapshot;
}
