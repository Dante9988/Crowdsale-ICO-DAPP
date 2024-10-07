const Info = ({account, accountBalance}) => {
    return(
        <div className="my-3">
            <div className="connected-text">
                <strong>Connected:</strong> {account}
            </div>
            <div className="tokens-owned">
                <strong>Tokens Owned:</strong> {accountBalance}
            </div>
        </div>
    )
}

export default Info;