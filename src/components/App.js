import { Container } from "react-bootstrap";
import { ethers } from "ethers/lib";
import { useEffect, useState } from "react";
import TokenInterface from '../abis/Token.json'
import CrowdsaleInterface from '../abis/Crowdsale.json'
import config from '../config.json'

// Components
import Navigation from './Navigation'
import Info from './Info';
import Loading from "./Loading";
import Progress from "./Progress";
import Buy from "./Buy";

const formatUnits = (n) => {
    return ethers.utils.formatUnits(n, 18);
}

function App() {
    const [provider, setProvider] = useState(null);
    const [crowdsale, setCrowdsale] = useState(null);

    const [account, setAccount] = useState(null);
    const [accountBalance, setAccountBalance] = useState(0);
    
    const [price, setPrice] = useState(0);
    const [maxTokens, setMaxTokens] = useState(0);
    const [tokensSold, setTokensSold] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    
    const loadBlockchainData = async () => {
        // Initiate provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const { chainId } = await provider.getNetwork()
        // Initiate contracts
        const token = new ethers.Contract(config[chainId].token.address, TokenInterface.abi, provider);
        const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CrowdsaleInterface.abi, provider);
        setCrowdsale(crowdsale);

        // Fetch account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);

        // Fetch account balance
        const accountBalance = formatUnits(await token.balanceOf(account));
        setAccountBalance(accountBalance);

        const price = formatUnits(await crowdsale.price());
        setPrice(price);
        const maxTokens = formatUnits(await crowdsale.maxTokens());
        setMaxTokens(maxTokens);
        const tokensSold = formatUnits(await crowdsale.tokensSold());
        setTokensSold(tokensSold);

        setIsLoading(false);
    }

    useEffect(() => {
        if(isLoading) {
            loadBlockchainData();
        }
    
    }, [isLoading]);

    return(
        <Container>
            <Navigation />

            <h1 className="my-4 text-center">Introducing DragonAI Token!</h1>

            { isLoading ? (
                <Loading />
            ) : (
                <>
                <p className="text-center"><strong>Current Price:</strong> {price} ETH</p>
                <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
                <Progress maxTokens={maxTokens} tokensSold={tokensSold}/>
                </>
            )}

            <hr />

            {account && (
                <Info account={account} accountBalance={accountBalance}/>
            )}
        </Container>
    )
}

export default App;
