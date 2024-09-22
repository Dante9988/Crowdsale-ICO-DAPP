const Info = ({account, accountBalance}) => {
    return(
        <div className="my-3">
            <p><strong>Connected:</strong> {account}</p>
            <p><strong>Tokens Owned:</strong> {accountBalance}</p>
        </div>
    )
}

export default Info;