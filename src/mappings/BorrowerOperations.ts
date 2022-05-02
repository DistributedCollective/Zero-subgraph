import {
  TroveUpdated,
  ZUSDBorrowingFeePaid,
} from "../../generated/BorrowerOperations/BorrowerOperations";

import { getTroveOperationFromBorrowerOperation } from "../types/TroveOperation";

import {
  setBorrowingFeeOfLastTroveChange,
  updateTrove,
} from "../entities/Trove";
import { increaseTotalBorrowingFeesPaid } from "../entities/Global";
import { IUpdateRevenues, updateRevenues } from "../entities/Revenue";

export function handleTroveUpdated(event: TroveUpdated): void {
  updateTrove(
    event,
    getTroveOperationFromBorrowerOperation(event.params.operation),
    event.params._borrower,
    event.params._coll,
    event.params._debt,
    event.params.stake
  );
}

export function handleZUSDBorrowingFeePaid(event: ZUSDBorrowingFeePaid): void {
  setBorrowingFeeOfLastTroveChange(event.params._ZUSDFee);
  increaseTotalBorrowingFeesPaid(event.params._ZUSDFee);
  let revenueData = new IUpdateRevenues();
  revenueData.borrowFeeZUSD = event.params._ZUSDFee;
  revenueData.timestamp = event.block.timestamp;
  updateRevenues(revenueData);
}
