import { registerCoinService } from "./coins/coinService";
import { registerAuctionService } from "./auction/auctionService";

let bootstrapped = false;

export function bootstrapServerServices() {
  if (bootstrapped) return;

  registerCoinService();
  registerAuctionService();

  bootstrapped = true;

  console.log("[Bootstrap] Server services registered");
}