import useTokenContractAddress from './useTokenContractAddress';
import Web3Login from './Web3Login';

const Web3Controls = () => {
  const contractAddress = useTokenContractAddress();

  return (
    <div>
      <Web3Login />
    </div>
  );
};

export default Web3Controls;
