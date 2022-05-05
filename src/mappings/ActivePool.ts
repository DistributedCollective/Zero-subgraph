import {
  ActivePoolAddressChanged as ActivePoolAddressChangedEvent,
  ActivePoolETHBalanceUpdated as ActivePoolETHBalanceUpdatedEvent,
  ActivePoolZUSDDebtUpdated as ActivePoolZUSDDebtUpdatedEvent,
  BorrowerOperationsAddressChanged as BorrowerOperationsAddressChangedEvent,
  DefaultPoolAddressChanged as DefaultPoolAddressChangedEvent,
  ETHBalanceUpdated as ETHBalanceUpdatedEvent,
  EtherSent as EtherSentEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  StabilityPoolAddressChanged as StabilityPoolAddressChangedEvent,
  TroveManagerAddressChanged as TroveManagerAddressChangedEvent,
  ZUSDBalanceUpdated as ZUSDBalanceUpdatedEvent,
} from "../../generated/ActivePool/ActivePool";
import {
  ActivePoolAddressChanged,
  ActivePoolETHBalanceUpdated,
  ActivePoolZUSDDebtUpdated,
  BorrowerOperationsAddressChanged,
  DefaultPoolAddressChanged,
  ETHBalanceUpdated,
  EtherSent,
  OwnershipTransferred,
  StabilityPoolAddressChanged,
  TroveManagerAddressChanged,
  ZUSDBalanceUpdated,
} from "../../generated/schema";
import {
  updateStabilityPoolProfit,
  calculateStabilityPoolProfit,
  StabilityPoolProfitComponent,
} from "../entities/Revenue";

import { getTransaction } from "../entities/Transaction";

export function handleActivePoolAddressChanged(
  event: ActivePoolAddressChangedEvent
): void {
  let entity = new ActivePoolAddressChanged(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newActivePoolAddress = event.params._newActivePoolAddress;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleActivePoolETHBalanceUpdated(
  event: ActivePoolETHBalanceUpdatedEvent
): void {
  let entity = new ActivePoolETHBalanceUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._ETH = event.params._ETH;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleActivePoolZUSDDebtUpdated(
  event: ActivePoolZUSDDebtUpdatedEvent
): void {
  let entity = new ActivePoolZUSDDebtUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._ZUSDDebt = event.params._ZUSDDebt;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleBorrowerOperationsAddressChanged(
  event: BorrowerOperationsAddressChangedEvent
): void {
  let entity = new BorrowerOperationsAddressChanged(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newBorrowerOperationsAddress =
    event.params._newBorrowerOperationsAddress;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleDefaultPoolAddressChanged(
  event: DefaultPoolAddressChangedEvent
): void {
  let entity = new DefaultPoolAddressChanged(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newDefaultPoolAddress = event.params._newDefaultPoolAddress;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleETHBalanceUpdated(event: ETHBalanceUpdatedEvent): void {
  let entity = new ETHBalanceUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newBalance = event.params._newBalance;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleEtherSent(event: EtherSentEvent): void {
  let entity = new EtherSent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._to = event.params._to;
  entity._amount = event.params._amount;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();

  /** TODO: Don't hardcode this */
  if (
    entity._to.toHexString() == "0x0dcedf5e080ed1d58b27b030d042d60971408d26" //Stability Pool address
  ) {
    /** Update stability pool profit */
    const profit = calculateStabilityPoolProfit(
      StabilityPoolProfitComponent.RbtcCollateral,
      entity._amount
    );
    updateStabilityPoolProfit({
      amount: profit,
      timestamp: event.block.timestamp,
    });
  }
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleStabilityPoolAddressChanged(
  event: StabilityPoolAddressChangedEvent
): void {
  let entity = new StabilityPoolAddressChanged(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newStabilityPoolAddress = event.params._newStabilityPoolAddress;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleTroveManagerAddressChanged(
  event: TroveManagerAddressChangedEvent
): void {
  let entity = new TroveManagerAddressChanged(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newTroveManagerAddress = event.params._newTroveManagerAddress;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}

export function handleZUSDBalanceUpdated(event: ZUSDBalanceUpdatedEvent): void {
  let entity = new ZUSDBalanceUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity._newBalance = event.params._newBalance;
  let transaction = getTransaction(event);
  entity.transaction = transaction.id;
  entity.timestamp = event.block.timestamp;
  entity.emittedBy = event.address;
  entity.save();
}
