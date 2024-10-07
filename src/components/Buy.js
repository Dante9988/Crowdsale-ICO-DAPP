import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { FaEthereum } from 'react-icons/fa';

const Buy = ({ provider, price, crowdsale, setIsLoading }) => {

    const [amount, setAmount] = useState("0");
    const [isWaiting, setIsWaiting] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isSaleLive, setIsSaleLive] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");

    const minAmount = 5;
    const maxAmount = 100000;

    const checkSaleStatus = async () => {
        try {
            const start = await crowdsale.startDate();
            const end = await crowdsale.endDate();
            const startDate = parseInt(start.toString());
            const endDate = parseInt(end.toString());
            const currentTime = Math.floor(Date.now() / 1000);

            setIsSaleLive(currentTime >= startDate && currentTime <= endDate);
        } catch (error) {
            console.error('Error fetching dates:', error);
        }
    };

    const handleAmountChange = (e) => {
        const inputAmount = e.target.value;
        setAmount(inputAmount);

        if (parseFloat(inputAmount) < minAmount) {
            setWarningMessage(`Minimum amount is ${minAmount} tokens.`);
        } else if (parseFloat(inputAmount) > maxAmount) {
            setWarningMessage(`Maximum amount is ${maxAmount} tokens.`);
        } else {
            setWarningMessage(""); // Clear the warning if within valid range
        }
    };

    const buyHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);

        try {
            const signer = await provider.getSigner();

            if (parseFloat(amount) < minAmount) {
                window.alert(`Minimum amount to buy is ${minAmount} tokens.`);
                setIsWaiting(false);
                return;
            } else if (parseFloat(amount) > maxAmount) {
                window.alert(`Maximum amount to buy is ${maxAmount} tokens.`);
                setIsWaiting(false);
                return;
            }

            // Fetch start and end dates from the contract
            const start = await crowdsale.startDate();
            const end = await crowdsale.endDate();

            const startDate = parseInt(await start.toString());
            const endDate = parseInt(await end.toString());
            const currentTime = Math.floor(Date.now() / 1000);

            // Check if sale is active
            if (currentTime < startDate) {
                window.alert('Sale has not started yet.');
                setIsWaiting(false);
                return;
            } else if (currentTime > endDate) {
                window.alert('Sale has ended.');
                setIsWaiting(false);
                return;
            }

            // Proceed with the token purchase if sale is live
            const value = ethers.utils.parseUnits((amount * price).toString(), 'ether');
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether');
            const txn = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: value });
            await txn.wait();

        } catch (error) {
            window.alert('User rejected or transaction reverted');
            console.error('Transaction error:', error);
        }
        setIsLoading(true);
    }

    useState(() => {
        checkSaleStatus();
    }, []);

    return (
        <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
            <Form.Group as={Row}>
                <Col>
                    {/* Input Group with React Icon */}
                    <InputGroup className={warningMessage !== "" ? "is-invalid" : ""}>
                        <InputGroup.Text>
                            <FaEthereum /> {/* Ethereum Icon */}
                        </InputGroup.Text>
                        <Form.Control
                            type="number"
                            placeholder="Enter amount"
                            onChange={handleAmountChange}
                        />
                    </InputGroup>
                    {warningMessage && (
                        <Alert variant="warning" style={{ marginTop: '10px' }}>
                            {warningMessage}
                        </Alert>
                    )}
                </Col>
                <Col className='text-center'>
                    {isWaiting ? (
                        <Spinner animation='border' />
                    ) : (
                        <Button
                            variant={isSaleLive ? "primary" : "danger"}
                            type="submit"
                            style={{ width: '100%' }}
                            disabled={!isSaleLive}
                        >
                            {isSaleLive ? 'Buy Tokens' : 'Sale Not Live'}
                        </Button>
                    )}

                </Col>
            </Form.Group>
        </Form>
    )
}

export default Buy;
