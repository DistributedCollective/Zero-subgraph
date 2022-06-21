import { Transfer } from "../../generated/ZUSDToken/ERC20";
import { TransferTransaction, TransferItem } from "../../generated/schema";
import { decimalize } from "../utils/bignumbers";

export function createTransferTransaction(event: Transfer): void {
  let transferTransaction = TransferTransaction.load(
    event.transaction.hash.toHexString()
  );
  if (transferTransaction === null) {
    transferTransaction = new TransferTransaction(
      event.transaction.hash.toHexString()
    );
    transferTransaction.user = event.transaction.from.toHexString();
    transferTransaction.timestamp = event.block.timestamp.toI32();
    transferTransaction.transaction = event.transaction.hash.toHexString();
    transferTransaction.save();
  }
  createTransferItem(event);
}

function createTransferItem(event: Transfer): void {
  let transferItem = new TransferItem(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toHexString()
  );

  transferItem.from = event.params.from.toHexString();
  transferItem.to = event.params.to.toHexString();
  transferItem.amount = decimalize(event.params.value);
  transferItem.transferTransaction = event.transaction.hash.toHexString();
  transferItem.logIndex = event.logIndex.toI32();
  transferItem.save();
}
