import {
  TroveUpdated,
  ZUSDBorrowingFeePaid
} from "../../generated/BorrowerOperations/BorrowerOperations";

import {
  BorrowerOperation,
  getTroveOperationFromBorrowerOperation
} from "../types/TroveOperation";

import {
  setBorrowingFeeOfLastTroveChange,
  updateTrove
} from "../entities/Trove";
import { IUpdateRevenues, updateBorrowFee } from "../entities/Revenue";
import { decimalize } from "../utils/bignumbers";
import { getTransaction } from "../entities/Transaction";
import { CallSignatures } from "../utils/constants";

export function handleTroveUpdated(event: TroveUpdated): void {
  const transaction = getTransaction(event);
  const borrowerOperation =
    transaction.functionSignature == CallSignatures.withdrawETHGainToTrove
      ? BorrowerOperation.transferGainToLineOfCredit
      : event.params.operation;
  updateTrove(
    event,
    getTroveOperationFromBorrowerOperation(borrowerOperation),
    event.params._borrower,
    event.params._coll,
    event.params._debt,
    event.params.stake
  );
}

export function handleZUSDBorrowingFeePaid(event: ZUSDBorrowingFeePaid): void {
  setBorrowingFeeOfLastTroveChange(event.params._ZUSDFee);
  let revenueData = new IUpdateRevenues();
  revenueData.amount = decimalize(event.params._ZUSDFee);
  revenueData.timestamp = event.block.timestamp;
  updateBorrowFee(revenueData);
}
