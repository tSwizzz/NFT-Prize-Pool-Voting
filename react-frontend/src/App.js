/** @format */
import Submit from "./Submit.js";
import Votes from "./Votes.js";
import { useState, useEffect } from "react";
import { connect, getContract } from "./contract.js";

function App() {
    const [contract, setContract] = useState(null);
    const [beginContest, setBeginContest] = useState(false);

    //checks to see if contest started or not.
    //if beginContest = false, then the Submit component is rendered.
    //if beginContest = true, then the Votes component is rendered.
    useEffect(() => {
        getContract().then(({ contract }) => {
            setContract(contract);
            if (contract) {
                contract.beginContestValue().then((value) => {
                    setBeginContest(value);
                });
            }
        });
    }, []);

    return (
        <>
            <div>hi</div>
            <div>{!beginContest ? <Submit /> : <Votes />}</div>
        </>
    );
}

export default App;
