import ProgressBar from "react-bootstrap/ProgressBar";

const Progress = ({ maxTokens, tokensSold }) => {
    const progressPercentage = (tokensSold / maxTokens) * 100;

    return (
        <div className="my-3" style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', width: '100%' }}>
            <ProgressBar 
                now={progressPercentage} 
                label={`${Math.round(progressPercentage)}%`} 
                style={{ height: '20px', backgroundColor: '#ccc' }} 
                variant="success"
            />
            <p className="text-center my-3">{tokensSold} / {maxTokens} Tokens Sold</p>
        </div>
    );
}

export default Progress;
