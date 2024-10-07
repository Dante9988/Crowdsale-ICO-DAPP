import ProgressBar from "react-bootstrap/ProgressBar";

const Progress = ({ maxTokens, tokensSold }) => {
    const progressPercentage = (tokensSold / maxTokens) * 100;

    return (
        <div className="progress-container">
            <ProgressBar 
                now={progressPercentage} 
                className="progress-bar"
            />
            <p className="progress-text">
                {tokensSold} / {maxTokens} Tokens Sold
            </p>
        </div>
    );
}

export default Progress;
