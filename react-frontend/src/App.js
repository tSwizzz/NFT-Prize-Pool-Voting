/** @format */
import { useState, useEffect } from "react";
import { connect, getContract } from "./contract";

function App() {
    const [contract, setContract] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
            if (accounts.length > 0) {
                handleInit();
            } else setConnected(false);
        });
    }, []);

    const handleInit = async () => {
        setConnected(true);
        getContract().then(({ contract, signer }) => {
            setContract(contract);

            if (contract) {
                signer.getAddress().then((address) => {
                    contract.owner().then((ownerAddr) => {
                        if (address == ownerAddr) {
                            console.log("test");
                        }
                    });
                });
            }
        });
    };

    return <div>wow</div>;
}

export default App;
