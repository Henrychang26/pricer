import axios from "axios";
import { TokenModel } from "../src/types";
import { ChainId, getNetwork } from "../src/constants";
import * as fs from "fs";
import * as path from "path";

interface TokenModelExtended extends TokenModel {
  extensions?: any;
}

interface TokenListModel {
  name: string;
  timestamp: string;
  version: { major: number; minor: number; patch: 0 };
  tags?: any;
  logoURI: string;
  keywords: string[];
  tokens: TokenModelExtended[];
}

const UNISWAP_LIST =
  "https://gateway.pinata.cloud/ipfs/QmaQvV3pWKKaWJcHvSBuvQMrpckV3KKtGJ6p3HZjakwFtX";
const SUSHI_LIST = "https://token-list.sushi.com/";
const OPTIMISM_LIST = "https://static.optimism.io/optimism.tokenlist.json";
const ARBITRUM_LIST = "https://bridge.arbitrum.io/token-list-42161.json";

const TOKEN_LIST_URLS = [
  UNISWAP_LIST,
  SUSHI_LIST,
  OPTIMISM_LIST,
  ARBITRUM_LIST,
];

//Checks object and ChainId enum
//finds id and compared to number type(after type cast)
//Returns a boolean whether or not it includes ID
const isValidChainId = (chainId: number) => {
  return Object.values(ChainId)
    .filter((id) => !isNaN(+id))
    .includes(chainId);
};

const request = async (url: string) => {
  try {
    const response = await axios.get<TokenListModel>(url, {
      headers: {
        Accept: "application/json , text/plain",
      },
    });
    return response.data;
  } catch (e) {
    console.error(`Failed to fetch token list from ${url}`);
    console.error(e);
  }
};

const main = async () => {
  const cached: Set<string> = new Set();

  // Mapped types
  // You can use a mapped type to create objects by iterating over keys.
  let tokenLists: { [id in ChainId]: TokenModelExtended[] } = {
    [ChainId.MAINNET]: [],
    [ChainId.OPTIMISM]: [],
    [ChainId.BSC]: [],
    [ChainId.POLYGON]: [],
    [ChainId.ARBITRUM]: [],
    [ChainId.AVALANCHE]: [],
  };

  for (const url of TOKEN_LIST_URLS) {
    const response = await request(url);
    //If unable to fetch current token, continue to next one
    if (!response) continue;

    tokenLists = response.tokens.reduce<{
      [id in ChainId]: TokenModelExtended[];
    }>((acc, token) => {
      const tokenKey = `${token.chainId}-${token.address}`;

      //Validate the token if chainId is included in enum of networks
      //Also checks if it already exists in cached
      if (!!isValidChainId(token.chainId) && !cached.has(tokenKey)) {
        //Delete token.extensions if available
        if (!!token.extensions) delete token.extensions;

        acc[token.chainId as ChainId].push(token);
        cached.add(tokenKey);
      }
      return acc;
    }, tokenLists);
  }
  //Destructuring the elements in tokenLists in order
  Object.entries(tokenLists).map(([chainId, tokenList]) => {
    const network = getNetwork(+chainId);

    const filePath = path.join(
      __dirname,
      "../src/schema/tokens",
      `${network.name}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(tokenList, null, 4));
  });
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
