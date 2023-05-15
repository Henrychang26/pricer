import { getNetworks } from "../src/constants/networks";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { AggregatorModel } from "../src/types";

interface Docs {
  nftFloorUnits: any;
  assetName?: string;
  feedCategory?: string;
  feedType?: string;
  hidden?: boolean;
  porAuditor?: string;
  porType?: string;
  shutdownDate?: string;
}

interface ChainMetadata {
  compareOffchain: string;
  contractAddress: string;
  contractType: string;
  contractVersion: number;
  decimalPlaces: number | null;
  ens: string | null;
  formatDecimalPlaces: number | null;
  healthPrice: string;
  heartbeat: number;
  history: boolean;
  multiply: string;
  name: string;
  pair: string[];
  path: string;
  proxyAddress: string | null;
  threshold: number;
  valuePrefix: string;
  assetName: string;
  feedCategory: string;
  feedType: string;
  docs: Docs;
  transmissionsAccount: string | null;
  decimals: number;
}

const main = async () => {
  const quoteFilters = ["bandwidth", "gas", "hc", "index", "pps"];

  const networks = getNetworks();

  for (const network of networks) {
    const response = await axios.get<ChainMetadata[]>(network.rddUrl);

    const aggregators = response.data
      .reduce<AggregatorModel[]>(
        (
          acc,
          {
            contractAddress,
            decimals,
            docs,
            feedCategory,
            name,
            path,
            proxyAddress,
          }
        ) => {
          //remove unnecessary strings in order to get only base and quote
          path = path
            .replace("calc-", "")
            .replace("calculated-", "")
            .replace(" exchangerate", "")
            .replace("-exchange-rate", "");

          const [base, quote] = path.split("-");

          if (
            //Cannot be hideen
            //Must "Crypto" feedType
            //Cannot be NFT
            //Cannot be off-chain/cross-chain
            //Cannot have a shutdown date
            //Must have feedCategory
            //Must be 2 segments after split("-")
            docs.hidden !== true &&
            docs.feedType === "Crypto" &&
            !docs.nftFloorUnits &&
            !docs.porType &&
            !docs.shutdownDate &&
            !quoteFilters.includes(quote) &&
            !!feedCategory &&
            path.split("-").length === 2
          ) {
            const feed: AggregatorModel = {
              name,
              category: feedCategory,
              path,
              base: base.toUpperCase(),
              //Sort everyhing to uppercase
              quote: quote.toUpperCase(),
              decimals,
              contractAddress,
              proxyAddress,
            };

            acc.push(feed);
          }

          return acc;
        },
        []
      )
      .sort((a, b) => (a.path < b.path ? -1 : 1));

    const filePath = path.join(
      __dirname,
      "../src/schema/feeds",
      `${network.name}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(aggregators, null, 4));
  }
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
